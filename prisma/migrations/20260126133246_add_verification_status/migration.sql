-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('STORE_CREDIT', 'ORIGINAL_PAYMENT');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerBusinessDetails" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "gst" TEXT,
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerBusinessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerDeliveryDetails" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "deliveryResponsibility" TEXT NOT NULL,
    "deliveryCoverage" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "deliveryTimeMin" INTEGER,
    "deliveryTimeMax" INTEGER,
    "shippingChargeType" TEXT NOT NULL,
    "shippingCharge" INTEGER,
    "internationalDelivery" BOOLEAN NOT NULL DEFAULT false,
    "installationAvailable" TEXT,
    "installationCharge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerDeliveryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerBankDetails" (
    "id" SERIAL NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "upiId" TEXT,
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerBankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "unitsPerTrip" INTEGER NOT NULL DEFAULT 1,
    "conversionFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "shippingCharge" INTEGER NOT NULL DEFAULT 0,
    "productType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "video" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'available',
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shareCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "casaCharge" DOUBLE PRECISION NOT NULL,
    "deliveryCharge" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "materialName" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT,
    "totalTrips" INTEGER NOT NULL DEFAULT 1,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "shippingCharge" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "returnStatus" "ReturnStatus" NOT NULL DEFAULT 'NONE',
    "returnReason" TEXT,
    "returnRequestedAt" TIMESTAMP(3),
    "returnResolvedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "refundProcessedAt" TIMESTAMP(3),
    "deliveryTimeMin" INTEGER,
    "deliveryTimeMax" INTEGER,
    "shippingChargeType" TEXT,
    "installationAvailable" TEXT,
    "installationCharge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designer" (
    "id" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "location" TEXT,
    "passwordHash" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'Available',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignerOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignerProfile" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "experience" TEXT,
    "portfolio" TEXT,
    "designerType" TEXT,
    "bio" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignerWork" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignerHireRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "designerId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "workType" TEXT NOT NULL,
    "timelineDate" TIMESTAMP(3),
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerHireRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignerRating" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "hireRequestId" INTEGER NOT NULL,
    "reviewerName" TEXT,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" SERIAL NOT NULL,
    "hireRequestId" INTEGER NOT NULL,
    "designerId" INTEGER,
    "reviewerName" TEXT,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "sellerName" TEXT,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "images" TEXT[],
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "adminApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "sellerApprovedAt" TIMESTAMP(3),
    "adminApprovedAt" TIMESTAMP(3),
    "sellerDecisionNote" TEXT,
    "adminDecisionNote" TEXT,
    "refundMethod" "RefundMethod",
    "refundAmount" DOUBLE PRECISION,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "refundDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "CustomerOtp_email_idx" ON "CustomerOtp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE INDEX "SellerOtp_email_idx" ON "SellerOtp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SellerBusinessDetails_sellerId_key" ON "SellerBusinessDetails"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerDeliveryDetails_sellerId_key" ON "SellerDeliveryDetails"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerBankDetails_sellerId_key" ON "SellerBankDetails"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_orderItemId_key" ON "Rating"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Designer_mobile_key" ON "Designer"("mobile");

-- CreateIndex
CREATE INDEX "DesignerOtp_email_idx" ON "DesignerOtp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DesignerProfile_designerId_key" ON "DesignerProfile"("designerId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignerRating_hireRequestId_key" ON "DesignerRating"("hireRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRating_hireRequestId_key" ON "UserRating"("hireRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_orderItemId_key" ON "ReturnRequest"("orderItemId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerBusinessDetails" ADD CONSTRAINT "SellerBusinessDetails_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerDeliveryDetails" ADD CONSTRAINT "SellerDeliveryDetails_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerBankDetails" ADD CONSTRAINT "SellerBankDetails_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerProfile" ADD CONSTRAINT "DesignerProfile_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerWork" ADD CONSTRAINT "DesignerWork_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerHireRequest" ADD CONSTRAINT "DesignerHireRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerHireRequest" ADD CONSTRAINT "DesignerHireRequest_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerRating" ADD CONSTRAINT "DesignerRating_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerRating" ADD CONSTRAINT "DesignerRating_hireRequestId_fkey" FOREIGN KEY ("hireRequestId") REFERENCES "DesignerHireRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_hireRequestId_fkey" FOREIGN KEY ("hireRequestId") REFERENCES "DesignerHireRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
