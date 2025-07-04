python -m venv venv
.\venv\Scripts\activate
pip install -r .\requirements.txt

cd .\frontend
npm install
cd..
uvicorn backend.main:app --reload 

//outro terminal
cd .\frontend
npm run dev
