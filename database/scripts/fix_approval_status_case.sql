-- One-time fix: Prisma AccountStatus enum expects UPPERCASE (APPROVED, PENDING, REJECTED).
-- If approval_status was written as lowercase, Prisma throws "Value 'approved' not found in enum 'AccountStatus'".
-- Run this once in Supabase SQL Editor: Database → SQL Editor → New query → paste → Run.

UPDATE profiles
SET approval_status = UPPER(approval_status)
WHERE approval_status IN ('approved', 'rejected', 'pending');
