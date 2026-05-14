-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "ServerMember" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';
