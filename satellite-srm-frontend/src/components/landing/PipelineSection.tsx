import React, { useState } from 'react';
import { PIPELINE_STAGES } from '../../types/satellite';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ArrowRight, CheckCircle2, ChevronRight, Layers, Cpu, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const PipelineSection: React.FC = () => {
  const [selectedStageIndex, setSelectedStageIndex] = useState(2); // default to AI Super Resolution

  const selectedStage = PIPELINE_STAGES[selectedStageIndex];

  return (
    <section id="pipeline" className="py-24 border-t border-border/40 glass-panel relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-4 uppercase tracking-widest font-semibold">
            Processing Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            The 7-Stage Satellite Reconstruction Pipeline
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
            From raw multispectral GeoTIFF ingestion to QGIS-ready sub-4m rasters. Click any stage to inspect computational tasks and scientific validation steps.
          </p>
        </div>

        {/* Horizontal scrollable stage selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isSelected = selectedStageIndex === idx;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageIndex(idx)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                    : 'border-border/50 bg-card/30 hover:bg-card/60 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    Step {stage.stepNumber}
                  </span>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/1)] animate-pulse"></span>}
                </div>
                <span className={`text-sm font-semibold line-clamp-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stage.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed stage view card */}
        <Card className="border-border/50 glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-border/40 pb-8 md:pb-0 md:pr-10 relative">
              <span className="font-mono text-xs text-primary uppercase font-bold tracking-widest flex items-center gap-2">
                <Cpu size={14} /> Stage {selectedStage.stepNumber} Spec
              </span>
              <h3 className="text-3xl font-bold text-foreground mt-4 mb-4 leading-tight">
                {selectedStage.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
                {selectedStage.description}
              </p>
              
              <div className="font-mono text-xs space-y-3 bg-background/50 p-5 rounded-xl border border-border/50 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pipeline ID:</span>
                  <span className="text-primary font-semibold">{selectedStage.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Execution Target:</span>
                  <span className="text-foreground font-medium">CPU / CUDA GPU</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Standard:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">NTRO Ready</span>
                </div>
              </div>
            </div>

            {/* Subtasks breakdown */}
            <div className="md:col-span-2 space-y-6 flex flex-col">
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                <Layers size={14} /> Granular Operations Executed
              </h4>
              
              <div className="space-y-4 flex-grow">
                {selectedStage.subTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-background/40 border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-mono text-foreground leading-relaxed">
                      {task}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-4 flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/30">
                <span>Stage sequence: {selectedStageIndex + 1} of {PIPELINE_STAGES.length}</span>
                <button
                  onClick={() => setSelectedStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length)}
                  className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-medium px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20"
                >
                  <span>Next stage</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </Card>

      </div>
    </section>
  );
};
