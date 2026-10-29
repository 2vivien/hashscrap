import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { SourceNewFormSchema, type SourceNewFormPayload } from "../validators/source-new.schema";
import { SOURCE_TYPE_LABEL, type SourceType } from "../types/source-new.types";

export interface SourceNewFormProps {
  defaults: SourceNewFormPayload;
  onSubmit: (values: SourceNewFormPayload) => void;
}

export function SourceNewForm({ defaults, onSubmit }: SourceNewFormProps) {
  const { register, control, handleSubmit, formState } = useForm<SourceNewFormPayload>({
    resolver: zodResolver(SourceNewFormSchema),
    defaultValues: defaults,
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-name">Nom</Label>
          <Input id="source-name" placeholder="Nom de la source" {...register("name")} />
          {formState.errors.name ? (
            <p className="text-[11px] text-red">{formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-type">Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="source-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SOURCE_TYPE_LABEL) as SourceType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {SOURCE_TYPE_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source-url">URL de base</Label>
        <Input id="source-url" type="url" placeholder="https://example.org" {...register("base_url")} />
        {formState.errors.base_url ? (
          <p className="text-[11px] text-red">{formState.errors.base_url.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source-hosts">Domaines autorisés</Label>
        <Input
          id="source-hosts"
          placeholder="example.org, api.example.org"
          {...register("allowed_hosts")}
        />
        {formState.errors.allowed_hosts ? (
          <p className="text-[11px] text-red">{formState.errors.allowed_hosts.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-timeout">Timeout (s)</Label>
          <Input id="source-timeout" type="number" {...register("limits.timeout_seconds", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-concurrency">Concurrence</Label>
          <Input id="source-concurrency" type="number" {...register("limits.concurrency", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-depth">Profondeur max</Label>
          <Input id="source-depth" type="number" {...register("limits.max_depth", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source-pages">Pages max</Label>
          <Input id="source-pages" type="number" {...register("limits.max_pages", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Continuer
        </Button>
      </div>
    </form>
  );
}
