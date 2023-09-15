import {
    loadFixture, time,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
  
describe("ContractTest", function () {  
    async function blankContract() {
        // Contracts are deployed using the first signer/account by default
        const [provider, otherAccount] = await ethers.getSigners();
      
        // Deploying with 10 ETH starting capital
        const StorageVictim = await ethers.getContractFactory("StorageVictim");
        const storageVictim = await StorageVictim.deploy();

        return { storageVictim, provider, otherAccount };
    }
  
    it("StorageVictim test", async function () {
        const { storageVictim, provider, otherAccount } = await loadFixture(blankContract);
        await storageVictim.store(1337)
        let retrievedStorage = await storageVictim.getStore()
        expect(retrievedStorage[1]).to.equal(1337);
    });
});
  