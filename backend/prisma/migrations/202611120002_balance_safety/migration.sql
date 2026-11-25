ALTER TABLE "User" ADD CONSTRAINT "User_balance_safe_integer" CHECK (balance <= 9007199254740991);
