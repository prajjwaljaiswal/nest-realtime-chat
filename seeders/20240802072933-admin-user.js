/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcrypt');
const uuid = require('uuid');
module.exports = {
  async up(queryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const pass = process.env.ADMIN_USER_PASSWORD ?? '123456';
    const password = await bcrypt.hash(pass, 10);
    await queryInterface.bulkInsert('Users', [
      {
        id: uuid.v4(),
        firstname: process.env.ADMIN_USER_FNAME ?? 'Admin',
        lastname: process.env.ADMIN_USER_LNAME ?? 'user',
        email: process.env.ADMIN_USER_EMAIL ?? 'admin@yopmail.com',
        isUserEmailVerify: true,
        password,
        status: true,
        role: 'SUPERADMIN',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete(
      'Users',
      {
        email: process.env.ADMIN_USER_EMAIL ?? 'admin@yopmail.com',
      },
      {},
    );
  },
};
