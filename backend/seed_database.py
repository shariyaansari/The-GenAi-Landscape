import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

def seed_data():
    """
    Reads the final combined JSON file and populates the MongoDB Atlas database.
    This script is meant to be run once to set up the initial data.
    """
    # --- 1. Load Environment Variables ---
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        print("Error: MONGO_URI not found in .env file.")
        return

    # --- 2. Connect to MongoDB Atlas ---
    try:
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri)
        db = client.GenAI_DB # Use a specific database name
        tools_collection = db.tools # And a specific collection name
        # Ping the server to confirm a successful connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

    # --- 3. Read the JSON Data File ---
    json_file_path = 'frontend_ready_tools.json'
    try:
        with open(json_file_path, 'r') as f:
            tools_data = json.load(f)
        print(f"Successfully loaded {len(tools_data)} tools from {json_file_path}.")
    except FileNotFoundError:
        print(f"Error: {json_file_path} not found. Please run combine_data.py first.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {json_file_path}.")
        return

    # --- 4. Push Data to the Database ---
    try:
        print("Clearing existing data in the 'tools' collection...")
        tools_collection.delete_many({}) # Clear the collection to avoid duplicates on re-runs

        print(f"Inserting {len(tools_data)} tools into the database...")
        result = tools_collection.insert_many(tools_data)
        
        print("\n✅ Database seeding complete!")
        print(f"Successfully inserted {len(result.inserted_ids)} documents.")
        
    except Exception as e:
        print(f"An error occurred during database insertion: {e}")
    finally:
        client.close()
        print("MongoDB connection closed.")


if __name__ == "__main__":
    seed_data()
# ```

### ## Step 4: Run the Seeding Script

# Now, you just need to run this script **once** to populate your cloud database.

# 1.  Make sure you have your final `frontend_ready_tools.json` file in your `backend` folder.
# 2.  Navigate to your `backend` folder in your terminal.
# 3.  Run the script:
#     ```bash
#     python seed_database.py