-- Add ratio field to expense_splits table
-- This allows us to store the split ratios alongside the dollar amounts

ALTER TABLE expense_splits 
ADD COLUMN ratio INTEGER DEFAULT 1;

-- Add comment to explain the field
COMMENT ON COLUMN expense_splits.ratio IS 'Split ratio for this user (e.g., 1, 2, 3 for different split amounts)';

-- Calculate and restore actual ratios from existing expense splits
-- This script finds the minimum amount per expense and calculates ratios accordingly
WITH expense_min_amounts AS (
  SELECT 
    expense_id,
    MIN(amount) as min_amount
  FROM expense_splits 
  GROUP BY expense_id
),
calculated_ratios AS (
  SELECT 
    es.id,
    es.expense_id,
    es.amount,
    ema.min_amount,
    CASE 
      WHEN ema.min_amount = 0 THEN 1
      ELSE ROUND(es.amount / ema.min_amount)
    END as calculated_ratio
  FROM expense_splits es
  JOIN expense_min_amounts ema ON es.expense_id = ema.expense_id
)
UPDATE expense_splits 
SET ratio = cr.calculated_ratio
FROM calculated_ratios cr
WHERE expense_splits.id = cr.id;
