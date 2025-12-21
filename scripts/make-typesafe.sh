#!/bin/bash
# Script to make all error handling type-safe
# Replaces all "error: any" with "error: unknown" and uses handleAPIError

echo "Making error handling type-safe..."

# Find all files with "error: any" in catch blocks
find app/actions -name "*.ts" -type f -exec grep -l "catch.*error.*any" {} \;

echo "Done. Review files and update manually."







