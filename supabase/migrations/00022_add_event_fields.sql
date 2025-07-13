-- Add event-related fields to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS event_frequency TEXT,
ADD COLUMN IF NOT EXISTS event_specific_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS event_weekday INTEGER,
ADD COLUMN IF NOT EXISTS event_time TEXT,
ADD COLUMN IF NOT EXISTS event_week_of_month INTEGER,
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT 'twitter',
ADD COLUMN IF NOT EXISTS contact_value TEXT;

-- Add check constraints for event_frequency
ALTER TABLE posts 
ADD CONSTRAINT event_frequency_check 
CHECK (event_frequency IS NULL OR event_frequency IN ('once', 'weekly', 'biweekly', 'monthly'));

-- Add check constraints for event_weekday (0-6 for Sunday-Saturday)
ALTER TABLE posts 
ADD CONSTRAINT event_weekday_check 
CHECK (event_weekday IS NULL OR (event_weekday >= 0 AND event_weekday <= 6));

-- Add check constraints for event_week_of_month (1-4)
ALTER TABLE posts 
ADD CONSTRAINT event_week_of_month_check 
CHECK (event_week_of_month IS NULL OR (event_week_of_month >= 1 AND event_week_of_month <= 4));

-- Add check constraints for contact_method
ALTER TABLE posts 
ADD CONSTRAINT contact_method_check 
CHECK (contact_method IS NULL OR contact_method IN ('twitter', 'discord', 'email'));