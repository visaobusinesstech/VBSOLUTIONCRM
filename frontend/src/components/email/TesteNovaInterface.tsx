import React from 'react';

export function TesteNovaInterface() {
  return (
    <div className="p-8 bg-green-100 border-2 border-green-500 rounded-lg">
      <h1 className="text-2xl font-bold text-green-800 mb-4">
        ✅ NOVA INTERFACE FUNCIONANDO!
      </h1>
      <p className="text-green-700">
        Se você está vendo esta mensagem, o hot reload está funcionando corretamente.
      </p>
      <p className="text-green-600 text-sm mt-2">
        Timestamp: {new Date().toLocaleString()}
      </p>
    </div>
  );
}
