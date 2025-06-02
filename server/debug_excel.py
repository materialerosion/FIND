# server/debug_excel.py
import os
import pandas as pd

def debug_excel():
    # Define the path to the Excel file
    excel_path = os.path.join("uploads", "Synaps Full 2025 Q1.xlsx")
    
    # Check if the file exists
    print(f"Checking if file exists at: {os.path.abspath(excel_path)}")
    if not os.path.exists(excel_path):
        print(f"ERROR: File not found at {os.path.abspath(excel_path)}")
        return
    
    print(f"File exists! Size: {os.path.getsize(excel_path)} bytes")
    
    # Try to read the file
    try:
        print("Attempting to read Excel file...")
        df = pd.read_excel(excel_path)
        print(f"Success! Read {len(df)} rows and {len(df.columns)} columns")
        
        # Print the first few column names to verify
        print("\nFirst 5 column names:")
        for i, col in enumerate(df.columns[:5]):
            print(f"  {i+1}. {col}")
        
        # Print a sample of the first row
        print("\nSample of first row:")
        first_row = df.iloc[0].head()
        for col, val in first_row.items():
            print(f"  {col}: {val}")
            
    except Exception as e:
        print(f"ERROR reading Excel file: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_excel()