'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('sequelize-cli').Migration} */
const uuid = require('uuid');
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'branding',
      [
        {
          id: uuid.v4(),
          logoPath: '/assets/images/logo_copy.png',
          bannerPath: '/assets/images/bannerImg.svg',
          fontName: 'cursive',
          bgColor: '#dab752',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('branding', null, {});
  },
};
