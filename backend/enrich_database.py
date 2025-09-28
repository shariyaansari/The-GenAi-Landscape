from pymongo import MongoClient
from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer

def enrich_data_with_embeddings():
    """
    Connects to MongoDB, loads an embedding model, and adds a vector embedding
    to each tool in the database based on its name, description, and categories.
    """
    # --- 1. Load Environment Variables & Connect to DB ---
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        print("Error: MONGO_URI not found in .env file.")
        return

    try:
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri)
        db = client.GenAI_DB
        tools_collection = db.tools
        client.admin.command('ping')
        print("✅ MongoDB connection successful.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

    # --- 2. Load the Embedding Model ---
    # This model is small, fast, and effective for semantic search.
    # The first time you run this, it will download the model (a few hundred MB).
    print("Loading sentence-transformer model (this may take a moment)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Model loaded successfully.")

    # --- 3. Iterate, Create Embeddings, and Update ---
    print("\nStarting to enrich documents with vector embeddings...")
    tools_to_update = list(tools_collection.find({"description_embedding": {"$exists": False}}))
    
    if not tools_to_update:
        print("All documents are already enriched. Nothing to do.")
        return

    print(f"Found {len(tools_to_update)} tools to enrich.")
    
    for tool in tools_to_update:
        try:
            # Create a combined text string for better semantic meaning
            combined_text = f"Name: {tool.get('name', '')}. Description: {tool.get('description', '')}. Categories: {', '.join(tool.get('categories', []))}"
            
            # Generate the embedding
            embedding = model.encode(combined_text).tolist()
            
            # Update the document in MongoDB with the new embedding field
            tools_collection.update_one(
                {'_id': tool['_id']},
                {'$set': {'description_embedding': embedding}}
            )
            print(f"  -> Enriched: {tool.get('name')}")

        except Exception as e:
            print(f"Could not process tool {tool.get('name')}. Error: {e}")
    
    print("\n✅ Database enrichment complete!")
    print("Your next step is to create a Vector Search Index in MongoDB Atlas.")


if __name__ == "__main__":
    enrich_data_with_embeddings()


### Step 3: Create a Vector Search Index in MongoDB Atlas

# This is a crucial step that you must do **manually** in your MongoDB Atlas dashboard. This index is what makes the similarity search incredibly fast.

# 1.  **Go to your Cluster:** Open your project in MongoDB Atlas and navigate to your database cluster.
# 2.  **Find the "Search" Tab:** Click on the "Search" tab.
# 3.  **Create Search Index:** Click the "Create Search Index" button.
# 4.  **Select "Atlas Vector Search":** Choose the JSON editor configuration option.
# 5.  **Configure the Index:**
#     * **Database and Collection:** Select your `GenAI_DB` and `tools` collection.
#     * **Index Name:** Give it a name, for example, `vector_index`.
#     * **JSON Editor:** Delete the default content and paste the following configuration. This tells Atlas to index our new `description_embedding` field.
#     ```json

{
    "fields": [
    {
      "type": "vector",
      "path": "description_embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}