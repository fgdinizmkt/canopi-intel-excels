import React from 'react';
import { Card, Button, Badge } from '../components/ui';
import { Puzzle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const Integrations: React.FC = () => {
  const integrations = [
    { name: 'Salesforce', status: 'connected', lastSync: 'há 5 min', icon: 'SF' },
    { name: 'HubSpot', status: 'connected', lastSync: 'há 12 min', icon: 'HS' },
    { name: 'LinkedIn Ads', status: 'error', lastSync: 'erro', icon: 'LI' },
    { name: 'Google Ads', status: 'connected', lastSync: 'há 2 min', icon: 'GA' },
    { name: 'Meta Ads', status: 'disconnected', lastSync: 'nunca', icon: 'MA' },
    { name: 'Slack', status: 'connected', lastSync: 'há 1 hora', icon: 'SL' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrações</h1>
          <p className="text-slate-500 mt-1">Gerencie suas conexões com plataformas de CRM, anúncios e ferramentas de comunicação.</p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800">
          <Puzzle className="w-4 h-4" />
          Nova Integração
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {integrations.map((int, i) => (
          <Card key={i} className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                {int.icon}
              </div>
              {int.status === 'connected' && <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>}
              {int.status === 'error' && <Badge className="bg-red-100 text-red-700">Erro</Badge>}
              {int.status === 'disconnected' && <Badge className="bg-slate-100 text-slate-600">Desconectado</Badge>}
            </div>
            <div>
              <h3 className="font-bold text-lg">{int.name}</h3>
              <p className="text-xs text-slate-500">Última sincronização: {int.lastSync}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="flex-1">Configurar</Button>
              {int.status !== 'connected' && <Button size="sm" className="flex-1">Conectar</Button>}
              {int.status === 'connected' && <Button variant="outline" size="sm" className="flex-1 text-red-600">Desconectar</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


export default Integrations;
