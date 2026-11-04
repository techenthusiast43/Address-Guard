const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AddressGuard Contract", function () {
  let addressGuard;
  let owner, user1, user2, target1, target2, target3;

  beforeEach(async function () {
    [owner, user1, user2, target1, target2, target3] = await ethers.getSigners();
    const AddressGuardFactory = await ethers.getContractFactory("AddressGuard");
    addressGuard = await AddressGuardFactory.deploy();
    await addressGuard.waitForDeployment();
  });

  describe("Adding Trusted Addresses", function () {
    it("should allow a user to add a trusted address with label and category", async function () {
      await expect(
        addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "Savings Vault", "Personal")
      )
        .to.emit(addressGuard, "AddressAdded")
        .withArgs(
          user1.address,
          target1.address,
          "Savings Vault",
          "Personal",
          (timestamp) => timestamp > 0
        );

      expect(await addressGuard.isTrusted(user1.address, target1.address)).to.be.true;
      expect(await addressGuard.isTrusted(user2.address, target1.address)).to.be.false;

      const list = await addressGuard.connect(user1).getMyTrustedAddresses();
      expect(list.length).to.equal(1);
      expect(list[0].wallet).to.equal(target1.address);
      expect(list[0].label).to.equal("Savings Vault");
      expect(list[0].category).to.equal("Personal");
    });

    it("should default category to 'Personal' if using addTrustedAddress(wallet, label)", async function () {
      await addressGuard.addTrustedAddress(target1.address, "My Cold Wallet");

      const list = await addressGuard.getMyTrustedAddresses();
      expect(list.length).to.equal(1);
      expect(list[0].category).to.equal("Personal");
      expect(list[0].label).to.equal("My Cold Wallet");
    });

    it("should revert if address is zero address", async function () {
      await expect(
        addressGuard.connect(user1).addTrustedAddressWithCategory(ethers.ZeroAddress, "Bad Address", "Personal")
      ).to.be.revertedWithCustomError(addressGuard, "ZeroAddressNotAllowed");
    });

    it("should revert if label is empty", async function () {
      await expect(
        addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "", "Personal")
      ).to.be.revertedWithCustomError(addressGuard, "EmptyLabelNotAllowed");
    });

    it("should prevent duplicate addresses for the same user", async function () {
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "First Label", "Personal");

      await expect(
        addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "Second Label", "Friends")
      ).to.be.revertedWithCustomError(addressGuard, "AddressAlreadyExists")
        .withArgs(target1.address);
    });

    it("should allow two different users to trust the same address independently", async function () {
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "User1 Label", "Personal");
      await addressGuard.connect(user2).addTrustedAddressWithCategory(target1.address, "User2 Label", "Friends");

      expect(await addressGuard.isTrusted(user1.address, target1.address)).to.be.true;
      expect(await addressGuard.isTrusted(user2.address, target1.address)).to.be.true;

      const user1List = await addressGuard.connect(user1).getMyTrustedAddresses();
      const user2List = await addressGuard.connect(user2).getMyTrustedAddresses();

      expect(user1List.length).to.equal(1);
      expect(user2List.length).to.equal(1);
      expect(user1List[0].label).to.equal("User1 Label");
      expect(user2List[0].label).to.equal("User2 Label");
    });
  });

  describe("Updating Labels and Categories", function () {
    beforeEach(async function () {
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "Old Label", "Personal");
    });

    it("should update label and emit LabelUpdated", async function () {
      await expect(
        addressGuard.connect(user1).updateLabel(target1.address, "Updated Label")
      )
        .to.emit(addressGuard, "LabelUpdated")
        .withArgs(user1.address, target1.address, "Updated Label");

      const list = await addressGuard.connect(user1).getMyTrustedAddresses();
      expect(list[0].label).to.equal("Updated Label");
    });

    it("should revert if updating label of non-existent address", async function () {
      await expect(
        addressGuard.connect(user1).updateLabel(target2.address, "New Label")
      ).to.be.revertedWithCustomError(addressGuard, "AddressNotFound");
    });

    it("should revert if updating label with an empty string", async function () {
      await expect(
        addressGuard.connect(user1).updateLabel(target1.address, "")
      ).to.be.revertedWithCustomError(addressGuard, "EmptyLabelNotAllowed");
    });

    it("should update category and emit CategoryUpdated", async function () {
      await expect(
        addressGuard.connect(user1).updateCategory(target1.address, "Projects")
      )
        .to.emit(addressGuard, "CategoryUpdated")
        .withArgs(user1.address, target1.address, "Projects");

      const list = await addressGuard.connect(user1).getMyTrustedAddresses();
      expect(list[0].category).to.equal("Projects");
    });
  });

  describe("Removing Trusted Addresses (Swap-and-Pop)", function () {
    beforeEach(async function () {
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "Target 1", "Personal");
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target2.address, "Target 2", "Friends");
      await addressGuard.connect(user1).addTrustedAddressWithCategory(target3.address, "Target 3", "Projects");
    });

    it("should remove an address and maintain state consistency", async function () {
      // Remove middle item (target2)
      await expect(addressGuard.connect(user1).removeTrustedAddress(target2.address))
        .to.emit(addressGuard, "AddressRemoved")
        .withArgs(user1.address, target2.address);

      expect(await addressGuard.isTrusted(user1.address, target2.address)).to.be.false;
      expect(await addressGuard.isTrusted(user1.address, target1.address)).to.be.true;
      expect(await addressGuard.isTrusted(user1.address, target3.address)).to.be.true;

      const list = await addressGuard.connect(user1).getMyTrustedAddresses();
      expect(list.length).to.equal(2);

      // Verify that target3 was swapped into target2's previous index
      expect(list[0].wallet).to.equal(target1.address);
      expect(list[1].wallet).to.equal(target3.address);
    });

    it("should allow re-adding an address after removal", async function () {
      await addressGuard.connect(user1).removeTrustedAddress(target1.address);
      expect(await addressGuard.isTrusted(user1.address, target1.address)).to.be.false;

      await expect(
        addressGuard.connect(user1).addTrustedAddressWithCategory(target1.address, "Target 1 Re-added", "Exchanges")
      ).to.emit(addressGuard, "AddressAdded");

      expect(await addressGuard.isTrusted(user1.address, target1.address)).to.be.true;
    });

    it("should revert if attempting to remove an un-saved address", async function () {
      await expect(
        addressGuard.connect(user1).removeTrustedAddress(owner.address)
      ).to.be.revertedWithCustomError(addressGuard, "AddressNotFound");
    });
  });
});
