import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  accessibilityScore: number;
  receptivityScore: number;
  persona: string;
  reportsTo?: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Ana Silva', email: 'ana@ibm.com', phone: '(11) 99999-9999', company: 'IBM Brasil', role: 'Gerente de Marketing', accessibilityScore: 5, receptivityScore: 4, persona: 'Decisor' },
    { id: '2', name: 'Carlos Souza', email: 'carlos@itau.com', phone: '(11) 88888-8888', company: 'Itaú Unibanco', role: 'Analista de Dados', accessibilityScore: 3, receptivityScore: 5, persona: 'Influenciador' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContact: Contact = {
      id: editingContact ? editingContact.id : Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      accessibilityScore: Number(formData.get('accessibilityScore')),
      receptivityScore: Number(formData.get('receptivityScore')),
      persona: formData.get('persona') as string,
      reportsTo: formData.get('reportsTo') as string || undefined,
    };

    if (editingContact) {
      setContacts(contacts.map(c => c.id === newContact.id ? newContact : c));
    } else {
      setContacts([...contacts, newContact]);
    }
    setIsModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contatos</h1>
          <p className="text-slate-500 mt-1">Gerencie sua base de contatos estratégicos.</p>
        </div>
        <Button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800">
          <Plus className="w-4 h-4" />
          Novo Contato
        </Button>
      </div>

      <Card className="p-6">
        <table className="w-full text-sm">
            <thead className="text-slate-400 text-xs uppercase">
                <tr>
                    <th className="text-left pb-4">Nome</th>
                    <th className="text-left pb-4">Empresa</th>
                    <th className="text-left pb-4">Cargo</th>
                    <th className="text-left pb-4">Acess.</th>
                    <th className="text-left pb-4">Recep.</th>
                    <th className="text-left pb-4">Papel</th>
                    <th className="text-right pb-4">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                    <tr key={contact.id}>
                        <td className="py-4 font-medium">{contact.name}</td>
                        <td className="py-4 text-slate-600">{contact.company}</td>
                        <td className="py-4 text-slate-600">{contact.role}</td>
                        <td className="py-4 text-slate-600">{contact.accessibilityScore}</td>
                        <td className="py-4 text-slate-600">{contact.receptivityScore}</td>
                        <td className="py-4 text-slate-600"><Badge>{contact.persona}</Badge></td>
                        <td className="py-4 text-right flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}><Edit2 className="w-4 h-4"/></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(contact.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContact ? 'Editar Contato' : 'Novo Contato'}>
        <form onSubmit={handleSave} className="space-y-4">
            <input name="name" defaultValue={editingContact?.name} placeholder="Nome" className="w-full p-2 border rounded-lg" required />
            <input name="email" defaultValue={editingContact?.email} placeholder="Email" className="w-full p-2 border rounded-lg" required />
            <input name="phone" defaultValue={editingContact?.phone} placeholder="Telefone" className="w-full p-2 border rounded-lg" />
            <select name="company" defaultValue={editingContact?.company} className="w-full p-2 border rounded-lg" required>
                <option value="">Selecione a Empresa</option>
                {Array.from(new Set(contacts.map(c => c.company))).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="NEW">Adicionar nova empresa...</option>
            </select>
            <input name="role" defaultValue={editingContact?.role} placeholder="Cargo" className="w-full p-2 border rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
                <select name="accessibilityScore" defaultValue={editingContact?.accessibilityScore} className="w-full p-2 border rounded-lg" required>
                    <option value="">Acessibilidade (0-5)</option>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select name="receptivityScore" defaultValue={editingContact?.receptivityScore} className="w-full p-2 border rounded-lg" required>
                    <option value="">Receptividade (0-5)</option>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <select name="persona" defaultValue={editingContact?.persona} className="w-full p-2 border rounded-lg" required>
                <option value="">Selecione o Papel</option>
                {['Decisor', 'Embaixador', 'Detrator', 'Comprador', 'Stakeholder', 'Gatekeeper', 'Influenciador'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex gap-2">
                <select name="reportsTo" defaultValue={editingContact?.reportsTo} className="w-full p-2 border rounded-lg">
                    <option value="">Responde a quem?</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Button type="button" variant="outline" size="sm">Criar Equipe</Button>
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </Modal>
    </div>
  );
};


export default Contacts;
