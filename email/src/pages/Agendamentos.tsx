
import React, { useEffect, useState } from 'react';
import { useSchedules } from '@/hooks/useSchedules';
import { ScheduleForm } from '@/components/schedules/ScheduleForm';
import { ScheduledEmailsMonitor } from '@/components/schedules/ScheduledEmailsMonitor';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus, RefreshCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SchedulesList } from '@/components/schedules/SchedulesList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Agendamentos() {
  const { schedules, loading, error, fetchSchedules } = useSchedules();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    console.log("Agendamentos: Fetching schedules");
    fetchSchedules();
  }, [fetchSchedules]);
  
  const handleScheduleCreated = () => {
    setDialogOpen(false);
    fetchSchedules();
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>
              Ocorreu um erro ao carregar os agendamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button 
              className="mt-4"
              onClick={() => {
                toast.info('Recarregando agendamentos...');
                fetchSchedules();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <ScrollArea className="max-h-[80vh] pr-4">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Agende o envio de uma mensagem para um contato.
                </DialogDescription>
              </DialogHeader>
              <ScheduleForm 
                onCancel={() => setDialogOpen(false)}
                onSuccess={handleScheduleCreated}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Lista de Agendamentos</TabsTrigger>
          <TabsTrigger value="monitor">Monitor do Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedules" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <SchedulesList 
              schedules={schedules}
              onRefresh={fetchSchedules}
            />
          )}
        </TabsContent>
        
        <TabsContent value="monitor">
          <ScheduledEmailsMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
