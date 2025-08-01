from flask import Flask, request, jsonify
import json
from datetime import datetime
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
ARQUIVO = 'dados.json'

@app.route('/', methods=['GET'])
def get_valores():
    if not os.path.exists(ARQUIVO):
        return jsonify({})
    with open(ARQUIVO, 'r', encoding='utf-8') as f:
        dados = json.load(f)
        return jsonify(dados[-1]) if dados else {}

@app.route('/', methods=['POST'])
def salvar_valores():
    data = request.get_json()
    print("📥 Recebido no POST:", data)

    if not data:
        return jsonify({'erro': 'Nenhum dado recebido'}), 400

    # Carrega o último registro salvo
    dados = []
    ultimo_dado = {}
    if os.path.exists(ARQUIVO):
        with open(ARQUIVO, 'r', encoding='utf-8') as f:
            try:
                dados = json.load(f)
                if dados:
                    ultimo_dado = dados[-1]
            except json.JSONDecodeError:
                dados = []

    # Merge do último dado com o novo + adiciona timestamp
    novo_dado = {**ultimo_dado, **data, 'dataHora': datetime.now().isoformat()}

    dados.append(novo_dado)

    with open(ARQUIVO, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)

    return jsonify({'sucesso': True, 'recebido': novo_dado})

if __name__ == '__main__':
    app.run(debug=True)