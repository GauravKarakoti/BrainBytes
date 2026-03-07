const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ByteToken", function () {
  let byteToken;
  let owner;
  let minter;
  let nonMinter;

  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens with 18 decimals

  beforeEach(async function () {
    // Get signers
    [owner, minter, nonMinter] = await ethers.getSigners();

    // Deploy ByteToken contract
    const ByteToken = await ethers.getContractFactory("ByteToken");
    byteToken = await ByteToken.deploy();
    await byteToken.waitForDeployment();

    // Grant MINTER_ROLE to minter account
    const MINTER_ROLE = await byteToken.MINTER_ROLE();
    const tx = await byteToken.grantRole(MINTER_ROLE, minter.address);
    await tx.wait();
  });

  describe("Minting with MAX_SUPPLY enforcement", function () {
    it("Should allow minter to mint tokens successfully below MAX_SUPPLY", async function () {
      const mintAmount = ethers.parseEther("100");
      
      // Mint tokens
      const tx = await byteToken.connect(minter).mint(minter.address, mintAmount);
      await tx.wait();

      // Verify balance
      const balance = await byteToken.balanceOf(minter.address);
      expect(balance).to.equal(mintAmount);

      // Verify totalSupply
      const totalSupply = await byteToken.totalSupply();
      expect(totalSupply).to.equal(mintAmount);
    });

    it("Should allow multiple mints as long as total is below MAX_SUPPLY", async function () {
      const mintAmount = ethers.parseEther("500000000"); // 500M tokens

      // First mint
      const tx1 = await byteToken.connect(minter).mint(minter.address, mintAmount);
      await tx1.wait();

      // Second mint (total will be 1B)
      const tx2 = await byteToken.connect(minter).mint(minter.address, mintAmount);
      await tx2.wait();

      // Verify totalSupply equals MAX_SUPPLY
      const totalSupply = await byteToken.totalSupply();
      expect(totalSupply).to.equal(MAX_SUPPLY);
    });

    it("Should revert when minting tokens that would exceed MAX_SUPPLY", async function () {
      // Mint up to MAX_SUPPLY first
      const tx1 = await byteToken.connect(minter).mint(minter.address, MAX_SUPPLY);
      await tx1.wait();

      // Try to mint more (should revert)
      const additionalAmount = ethers.parseEther("1");
      
      await expect(
        byteToken.connect(minter).mint(minter.address, additionalAmount)
      ).to.be.revertedWith("Exceeds maximum supply");
    });

    it("Should revert with correct error message when partial mint exceeds MAX_SUPPLY", async function () {
      const almostMax = ethers.parseEther("999999999"); // 999M tokens
      const tx1 = await byteToken.connect(minter).mint(minter.address, almostMax);
      await tx1.wait();

      // Try to mint 2 tokens (total would be 999M + 2)
      const excessAmount = ethers.parseEther("2");

      await expect(
        byteToken.connect(minter).mint(minter.address, excessAmount)
      ).to.be.revertedWith("Exceeds maximum supply");
    });

    it("Should allow minting exactly to MAX_SUPPLY", async function () {
      const tx = await byteToken.connect(minter).mint(minter.address, MAX_SUPPLY);
      await tx.wait();

      const totalSupply = await byteToken.totalSupply();
      expect(totalSupply).to.equal(MAX_SUPPLY);

      const balance = await byteToken.balanceOf(minter.address);
      expect(balance).to.equal(MAX_SUPPLY);
    });
  });

  describe("Role-based access control", function () {
    it("Should revert when non-minter tries to mint", async function () {
      const mintAmount = ethers.parseEther("100");

      await expect(
        byteToken.connect(nonMinter).mint(nonMinter.address, mintAmount)
      ).to.be.revertedWith("Caller is not a minter");
    });

    it("Should allow owner (who has MINTER_ROLE) to mint", async function () {
      const mintAmount = ethers.parseEther("100");

      const tx = await byteToken.connect(owner).mint(owner.address, mintAmount);
      await tx.wait();

      const balance = await byteToken.balanceOf(owner.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should allow owner to grant and revoke MINTER_ROLE", async function () {
      const MINTER_ROLE = await byteToken.MINTER_ROLE();
      const mintAmount = ethers.parseEther("100");

      // Grant role to nonMinter
      const grantTx = await byteToken.grantRole(MINTER_ROLE, nonMinter.address);
      await grantTx.wait();

      // Now nonMinter should be able to mint
      const mintTx = await byteToken.connect(nonMinter).mint(nonMinter.address, mintAmount);
      await mintTx.wait();

      expect(await byteToken.balanceOf(nonMinter.address)).to.equal(mintAmount);

      // Revoke role
      const revokeTx = await byteToken.revokeRole(MINTER_ROLE, nonMinter.address);
      await revokeTx.wait();

      // Now nonMinter should not be able to mint
      await expect(
        byteToken.connect(nonMinter).mint(nonMinter.address, mintAmount)
      ).to.be.revertedWith("Caller is not a minter");
    });
  });

  describe("ERC-20 functionality", function () {
    it("Should have correct token name and symbol", async function () {
      expect(await byteToken.name()).to.equal("BrainByte");
      expect(await byteToken.symbol()).to.equal("BYTE");
    });

    it("Should have 18 decimal places", async function () {
      expect(await byteToken.decimals()).to.equal(18);
    });

    it("Should allow token transfers after minting", async function () {
      const mintAmount = ethers.parseEther("100");

      // Mint tokens
      const mintTx = await byteToken.connect(minter).mint(minter.address, mintAmount);
      await mintTx.wait();

      // Transfer tokens
      const transferAmount = ethers.parseEther("50");
      const transferTx = await byteToken.connect(minter).transfer(nonMinter.address, transferAmount);
      await transferTx.wait();

      // Verify balances
      expect(await byteToken.balanceOf(minter.address)).to.equal(ethers.parseEther("50"));
      expect(await byteToken.balanceOf(nonMinter.address)).to.equal(transferAmount);
    });
  });
});
