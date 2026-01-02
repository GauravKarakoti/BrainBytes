import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying ByteToken contract...");

  const ByteToken = await ethers.getContractFactory("ByteToken");

  const byteToken = await ByteToken.deploy();

  await byteToken.waitForDeployment();

  const contractAddress = await byteToken.getAddress();
  
  console.log(`✅ ByteToken deployed to: ${contractAddress}`);

  console.log(`\n----------------------------------------------------`);
  console.log(`Set this in your .env.local file:`);
  console.log(`NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=${contractAddress}`);
  console.log(`----------------------------------------------------`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });