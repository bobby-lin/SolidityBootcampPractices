const { expect, use, assert } = require("chai");
const { ethers } = require("hardhat");

const { solidity } = require("ethereum-waffle");
use(solidity);

const DAIAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("DeFi", () => {
  let owner;
  let DAI_TokenContract;
  let USDC_TokenContract;
  let DeFi_Instance;
  const INITIAL_AMOUNT = 999999999000000;
  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    const whale = await ethers.getSigner(
      "0x503828976D22510aad0201ac7EC88293211D23Da"
    );
    console.log("owner account is ", owner.address);

    DAI_TokenContract = await ethers.getContractAt("ERC20", DAIAddress);
    USDC_TokenContract = await ethers.getContractAt("ERC20", USDCAddress);
    const symbol = await DAI_TokenContract.symbol();
    console.log(symbol);
    const DeFi = await ethers.getContractFactory("DeFi");

    await DAI_TokenContract.connect(whale).transfer(
      owner.address,
      BigInt(INITIAL_AMOUNT)
    );

    DeFi_Instance = await DeFi.deploy();
  });

  it("should check transfer succeeded", async () => {
    const whale = await ethers.getSigner(
      "0x503828976D22510aad0201ac7EC88293211D23Da"
    );

    let transactionStatus = await DAI_TokenContract.connect(whale).transfer(
      DeFi_Instance.address,
      BigInt(INITIAL_AMOUNT)
    )
    assert(await transactionStatus.wait() != null)
  });

  it("should sendDAI to contract", async () => {
    const whale = await ethers.getSigner(
      "0x503828976D22510aad0201ac7EC88293211D23Da"
    );

    let current_DAI_Balance = await DAI_TokenContract.balanceOf("0x503828976D22510aad0201ac7EC88293211D23Da");

    await DAI_TokenContract.connect(whale).transfer(
      DeFi_Instance.address,
      BigInt(INITIAL_AMOUNT)
    )

    let finalBalance = await DAI_TokenContract.balanceOf("0x503828976D22510aad0201ac7EC88293211D23Da");
    let expectedValue = current_DAI_Balance.sub(BigInt(INITIAL_AMOUNT));
    // Useful Docs: https://docs.ethers.io/v5/api/utils/bignumber/

    // console.log(current_DAI_Balance, finalBalance, expectedValue);
    expect(parseInt(finalBalance)).to.lessThanOrEqual(parseInt(expectedValue));
  });

  it("should make a swap", async () => {
    let current_USDC_balance = await USDC_TokenContract.balanceOf(owner.address);
    await DeFi_Instance.swapDAItoUSDC(BigInt(INITIAL_AMOUNT)); // Must use BigInt as value for swap
    let finalBalance = await USDC_TokenContract.balanceOf(owner.address);
    //console.log(current_USDC_balance, finalBalance)
    expect(parseInt(finalBalance)).to.equal(parseInt(current_USDC_balance) + 998)
  });
});
