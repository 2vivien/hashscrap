import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { SourceNewFormSchema, type SourceNewFormPayload } from "../validators/source-new.schema";
import { SOURCE_TYPE_LABEL, type SourceType } from "../types/source-new.types";

export interface SourceNewFormProps {
  defaults?: SourceNewFormPayload;
  onSubmit: (values: SourceNewFormPayload) => void;
}

export function SourceNewForm({ defaults = { nom: "", url: "", type: "web", domaines: [] }, onSubmit }: SourceNewFormProps) {
  const { register, control, handleSubmit, setValue, watch, formState } = useForm<SourceNewFormPayload>({
    resolver: zodResolver(SourceNewFormSchema),
    defaultValues: defaults,
  });
  const domaines = watch("domaines");
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1.5"><Label htmlFor="source-nom">Nom</Label><Input id="source-nom" maxLength={120} {...register("nom")} />{formState.errors.nom ? <p className="text-xs text-red">{formState.errors.nom.message}</p> : null}</div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="source-type">Type</Label><Select value={watch("type")} onValueChange={(value) => setValue("type", value as SourceType)}><SelectTrigger id="source-type"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(SOURCE_TYPE_LABEL) as SourceType[]).map((type) => <SelectItem key={type} value={type}>{SOURCE_TYPE_LABEL[type]}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="source-url">URL</Label><Input id="source-url" type="url" maxLength={4096} {...register("url")} />{formState.errors.url ? <p className="text-xs text-red">{formState.errors.url.message}</p> : null}</div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="source-domaines">Domaines autorisés (séparés par des virgules)</Label><Input id="source-domaines" value={domaines.join(", ")} onChange={(event) => setValue("domaines", event.target.value.split(",").map((v) => v.trim()).filter(Boolean))} />{formState.errors.domaines ? <p className="text-xs text-red">{formState.errors.domaines.message}</p> : null}</div>
      <div className="flex justify-end"><Button type="submit" variant="primary">Enregistrer la source</Button></div>
    </form>
  );
}
