import { useState } from 'react';
import { useSources } from './hooks/useSources';
import { SourcesTable } from './components/SourcesTable';
import { DomainesValidation } from './components/DomainesValidation';
import { StatsCard } from './components/StatsCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const SourcesPage = () => {
  const { data, isLoading, error } = useSources();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!data) return null;

  const filteredData = data.items.filter((source) => {
    const matchesFilter = filter === '' || source.nom.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === '' || source.type === typeFilter;
    const matchesStatus = statusFilter === '' || source.statut === statusFilter;
    return matchesFilter && matchesType && matchesStatus;
  });

  const domaines = [...new Set(data.items.flatMap((source) => source.domaines))];
  const validees = data.items.filter((source) => source.statut === 'validee').length;
  const tauxSucces = Math.round((validees / data.total) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sources"
        description="Gérez vos points d'entrée de collecte"
        actions={[
          <Button key="new-source" variant="secondary" size="sm">
            Nouvelle source
          </Button>,
        ]}
      />

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Filtrer..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="reseau">Réseau</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les statuts</SelectItem>
            <SelectItem value="validee">Validée</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="erreur">Erreur</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilter('');
            setTypeFilter('');
            setStatusFilter('');
          }}
        >
          Réinitialiser
        </Button>
      </div>

      <div className="text-sm text-ink-secondary">
        {filteredData.length} sources
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <SourcesTable data={filteredData} />

        <div className="space-y-6">
          <DomainesValidation domaines={domaines} />
          <StatsCard validees={validees} total={data.total} tauxSucces={tauxSucces} />
        </div>
      </div>
    </div>
  );
};

export default SourcesPage;
