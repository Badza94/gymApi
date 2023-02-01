/*
  Warnings:

  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DeleteRows
DELETE FROM "users" WHERE "password" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" SET DEFAULT '123';
