-- Add manager field to ad_performance table for tracking which traffic manager delivered results
ALTER TABLE public.ad_performance 
ADD COLUMN manager TEXT;