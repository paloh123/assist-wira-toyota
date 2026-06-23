-- CreateTable
CREATE TABLE "pending_wo" (
    "id" SERIAL NOT NULL,
    "outlet_code" TEXT NOT NULL,
    "wo_no" TEXT NOT NULL,
    "wo_date" TIMESTAMP(3) NOT NULL,
    "chassis_no" TEXT,
    "operation_desc" TEXT,
    "operation_type" TEXT,
    "labor_code" TEXT,
    "labor_amount" DOUBLE PRECISION,
    "part_amount" DOUBLE PRECISION,
    "oil_amount" DOUBLE PRECISION,
    "tyre_amount" DOUBLE PRECISION,
    "discount" DOUBLE PRECISION,
    "other_amount" DOUBLE PRECISION,
    "raw_col13" TEXT,
    "raw_col14" TEXT,
    "remark" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "upload_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_wo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_inv" (
    "id" SERIAL NOT NULL,
    "outlet_code" TEXT NOT NULL,
    "wo_no" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "part_no" TEXT NOT NULL,
    "part_desc" TEXT,
    "unit_price" DOUBLE PRECISION,
    "qty" INTEGER,
    "amount" DOUBLE PRECISION,
    "discount" DOUBLE PRECISION,
    "ppn" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "po_no" TEXT,
    "raw_col_a" TEXT,
    "raw_col_b" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "upload_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_inv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_history" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "total_data" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "upload_date" TIMESTAMP(3) NOT NULL,
    "user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "month" TEXT NOT NULL DEFAULT '',
    "ratio" DOUBLE PRECISION NOT NULL DEFAULT 1.1,
    "target_tam" INTEGER NOT NULL DEFAULT 0,
    "hk" INTEGER NOT NULL DEFAULT 0,
    "plan_per_day" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_plan" (
    "id" SERIAL NOT NULL,
    "plan_date" TIMESTAMP(3) NOT NULL,
    "plan_count" INTEGER NOT NULL DEFAULT 0,
    "actual_wo" INTEGER NOT NULL DEFAULT 0,
    "actual_inv" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_wo_status_idx" ON "pending_wo"("status");

-- CreateIndex
CREATE INDEX "pending_wo_outlet_code_idx" ON "pending_wo"("outlet_code");

-- CreateIndex
CREATE INDEX "pending_wo_upload_date_idx" ON "pending_wo"("upload_date");

-- CreateIndex
CREATE UNIQUE INDEX "pending_wo_wo_no_outlet_code_wo_date_key" ON "pending_wo"("wo_no", "outlet_code", "wo_date");

-- CreateIndex
CREATE INDEX "pending_inv_status_idx" ON "pending_inv"("status");

-- CreateIndex
CREATE INDEX "pending_inv_outlet_code_idx" ON "pending_inv"("outlet_code");

-- CreateIndex
CREATE INDEX "pending_inv_upload_date_idx" ON "pending_inv"("upload_date");

-- CreateIndex
CREATE UNIQUE INDEX "pending_inv_invoice_no_wo_no_part_no_key" ON "pending_inv"("invoice_no", "wo_no", "part_no");

-- CreateIndex
CREATE UNIQUE INDEX "daily_plan_plan_date_key" ON "daily_plan"("plan_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
