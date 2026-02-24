-- Make the receipts bucket public so users can view receipts
UPDATE storage.buckets SET public = true WHERE id = 'receipts';