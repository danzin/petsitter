
# PetSitter App 🐾

Welcome to PetSitter, the app that connects pet owners with trusted pet sitters. Whether you're heading out of town or just need a helping hand, PetSitter makes finding reliable care for your furry friends a breeze.
It's built with 

Tech stack:

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚧 Work in Progress 

The project is under development. Currently, users can: 
 - Register an account as either a pet sitter or a pet owner, secured using NextAuth.
 - Edit user account, set services they offer, hourly rate, bio, availability.
 - Seamlessly switch between pet sitters and pet owners through the user dashboard.
 - Add and edit pets

What's on the horizon: 

 - Booking System: Schedule and manage pet sitting appointments.
 - Review system: Leave a review after an appointment. 
 - Search Functionality: Effortlessly find the perfect sitter based on your preferences.


## 📸 Preview

 - Landing page of PetSitter (early prototype)
  ![image](https://github.com/user-attachments/assets/1ebb8b3a-5b64-417d-83eb-f02625f04f9d)

## ✨ Planned features

 - Browse and book trusted pet sitters.
 - Manage user profiles and preferences.
 - Leave reviews and ratings for sitters or owners.

## 📌 Note
This app is not production-ready. Many features are still under development, and some functionalities might not work as intended yet. It's like 

## Running the app 

 - Clone the repository and navigate to the directory

   `git clone https://github.com/danzin/petsitter.git`
   
   `cd petsitter`
- Install dependencies

  `npm install`

- Configure .env file in the core directory. It's running Prisma with PostgreSQL, with Prisma's Accelerate enabled.
  ```
  //.env
  DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

- Run the database migrations
  
  `npx prisma migrate dev` 

- Run the dev server
  
  `npm run dev`

  
