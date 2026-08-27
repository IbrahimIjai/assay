// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IBorrowVerifier} from "./interfaces/IBorrowVerifier.sol";
import {ReserveRegistry} from "./ReserveRegistry.sol";
import {LendingPool} from "./LendingPool.sol";

/// @title ShieldedVault
/// @notice Commitment-based collateral vault skeleton for private RWA positions.
/// @dev Amounts are not stored per note in plaintext. The borrow proof is expected to reveal only
///      the public values needed by the verifier. This contract deliberately leaves the full
///      borrower eligibility circuit behind IBorrowVerifier.
contract ShieldedVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Loan {
        bytes32 asset;
        bytes32 noteCommitment;
        address borrower;
        uint256 collateralAmount;
        uint256 debt;
        uint64 maturity;
        bool repaid;
        bool auctioned;
    }

    IERC20 public immutable stablecoin;
    LendingPool public immutable pool;
    ReserveRegistry public immutable reserves;
    IBorrowVerifier public borrowVerifier;

    mapping(bytes32 asset => IERC20 token) public rwaTokens;
    struct Note {
        bytes32 asset;
        address owner;
        uint256 amount;
        bool locked;
    }

    mapping(bytes32 commitment => Note) public notes;
    mapping(bytes32 nullifier => bool) public nullifierUsed;
    mapping(bytes32 loanId => Loan) public loans;

    error InvalidProof();
    error NoteExists();
    error UnknownNote();
    error NullifierUsed();
    error InvalidAsset();
    error InvalidDebt();
    error InvalidMaturity();
    error LoanNotFound();
    error AlreadyRepaid();
    error NotMatured();
    error NotNoteOwner();
    error DebtAboveLtv();

    event AssetTokenSet(bytes32 indexed asset, address indexed token);
    event Deposited(bytes32 indexed asset, bytes32 indexed commitment, uint256 amount);
    event Borrowed(bytes32 indexed loanId, bytes32 indexed asset, uint256 debt, uint64 maturity);
    event Repaid(bytes32 indexed loanId, uint256 amount);
    event Auctioned(bytes32 indexed loanId);

    constructor(
        address initialOwner,
        LendingPool pool_,
        ReserveRegistry reserves_,
        IBorrowVerifier verifier_
    ) Ownable(initialOwner) {
        pool = pool_;
        stablecoin = pool_.asset();
        reserves = reserves_;
        borrowVerifier = verifier_;
    }

    function setBorrowVerifier(IBorrowVerifier verifier_) external onlyOwner {
        borrowVerifier = verifier_;
    }

    function setAssetToken(bytes32 asset, IERC20 token) external onlyOwner {
        rwaTokens[asset] = token;
        emit AssetTokenSet(asset, address(token));
    }

    function deposit(bytes32 asset, uint256 amount, bytes32 noteCommitment) external nonReentrant {
        IERC20 token = rwaTokens[asset];
        if (address(token) == address(0)) revert InvalidAsset();
        if (amount == 0) revert InvalidDebt();
        if (notes[noteCommitment].owner != address(0)) revert NoteExists();

        token.safeTransferFrom(msg.sender, address(this), amount);
        notes[noteCommitment] = Note(asset, msg.sender, amount, false);
        emit Deposited(asset, noteCommitment, amount);
    }

    /// @dev publicInputs layout for the future borrow_eligibility circuit:
    /// [0] noteRoot, [1] claimRoot, [2] oraclePrice, [3] coverageFresh,
    /// [4] debtAmount, [5] nullifier, [6] newCommitment.
    function borrow(
        bytes32 asset,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[7] calldata publicInputs,
        address stealthPayout,
        uint64 maturity
    ) external nonReentrant returns (bytes32 loanId) {
        if (rwaTokens[asset] == IERC20(address(0))) revert InvalidAsset();
        if (stealthPayout == address(0)) revert InvalidDebt();
        if (maturity <= block.timestamp) revert InvalidMaturity();
        if (publicInputs[3] != 1 || !reserves.isFresh(asset)) revert InvalidProof();
        if (!reserves.getLatest(asset).covered) revert InvalidProof();
        if (nullifierUsed[bytes32(publicInputs[5])]) revert NullifierUsed();

        if (!borrowVerifier.verifyProof(a, b, c, publicInputs)) revert InvalidProof();

        uint256 debt = publicInputs[4];
        if (debt == 0) revert InvalidDebt();
        bytes32 commitment = bytes32(publicInputs[6]);
        Note storage note = notes[commitment];
        if (note.owner == address(0) || note.asset != asset || note.locked) revert UnknownNote();
        if (note.owner != msg.sender) revert NotNoteOwner();

        // Demo valuation: one vSILVER is $40 and loans are capped at 60% LTV.
        uint256 maxDebt = (note.amount * 40e6 * 6000) / (1e18 * 10_000);
        if (debt > maxDebt) revert DebtAboveLtv();

        nullifierUsed[bytes32(publicInputs[5])] = true;
        note.locked = true;
        loanId = keccak256(abi.encode(asset, commitment, publicInputs[5], block.chainid));
        loans[loanId] = Loan({
            asset: asset,
            noteCommitment: commitment,
            borrower: msg.sender,
            collateralAmount: note.amount,
            debt: debt,
            maturity: maturity,
            repaid: false,
            auctioned: false
        });

        pool.fundLoan(asset, stealthPayout, debt);
        emit Borrowed(loanId, asset, debt, maturity);
    }

    function repay(bytes32 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.maturity == 0) revert LoanNotFound();
        if (loan.repaid) revert AlreadyRepaid();

        uint256 payment = amount > loan.debt ? loan.debt : amount;
        stablecoin.safeTransferFrom(msg.sender, address(pool), payment);
        pool.recordRepayment(payment);
        if (payment == loan.debt) {
            loan.repaid = true;
            notes[loan.noteCommitment].locked = false;
            rwaTokens[loan.asset].safeTransfer(loan.borrower, loan.collateralAmount);
        } else {
            loan.debt -= payment;
        }

        emit Repaid(loanId, payment);
    }

    function auction(bytes32 loanId) external onlyOwner {
        Loan storage loan = loans[loanId];
        if (loan.maturity == 0) revert LoanNotFound();
        if (loan.repaid) revert AlreadyRepaid();
        if (block.timestamp < loan.maturity) revert NotMatured();
        loan.auctioned = true;
        emit Auctioned(loanId);
    }
}
