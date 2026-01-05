import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
  type AssetItem,
  type AssetCondition,
  type AssetType,
  assetConditions,
} from "@/data/offboarding";
import { Badge } from "@/components/ui/badge";

interface AssetReturnStepProps {
  assets: AssetItem[];
  onAssetsChange: (assets: AssetItem[]) => void;
}

const assetTypeLabels: Record<AssetType, string> = {
  hardware: "Hardware",
  keycard: "Keycard",
  documents: "Documents",
  other: "Other",
};

const conditionColors: Record<AssetCondition, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  good: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  damaged: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  missing: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function AssetReturnStep({ assets, onAssetsChange }: AssetReturnStepProps) {
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<AssetType>("hardware");

  const updateAsset = (id: string, field: keyof AssetItem, value: string) => {
    onAssetsChange(
      assets.map((asset) =>
        asset.id === id ? { ...asset, [field]: value } : asset
      )
    );
  };

  const addAsset = () => {
    if (!newAssetName.trim()) return;

    const newAsset: AssetItem = {
      id: `custom-${Date.now()}`,
      name: newAssetName,
      type: newAssetType,
      serialNumber: "",
      condition: "pending",
      notes: "",
    };

    onAssetsChange([...assets, newAsset]);
    setNewAssetName("");
    setNewAssetType("hardware");
  };

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter((asset) => asset.id !== id));
  };

  const markAllAsReturned = () => {
    onAssetsChange(
      assets.map((asset) => ({
        ...asset,
        condition: asset.condition === "pending" ? "good" : asset.condition,
      }))
    );
  };

  const pendingCount = assets.filter((a) => a.condition === "pending").length;
  const returnedCount = assets.filter((a) => a.condition === "good" || a.condition === "damaged").length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-sm text-muted-foreground">Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending Return</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{returnedCount}</div>
            <p className="text-sm text-muted-foreground">Returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Company Assets
              </CardTitle>
              <CardDescription>
                Track and verify the return of all company property
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsReturned}
              disabled={pendingCount === 0}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark All Returned
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {assetTypeLabels[asset.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={asset.serialNumber}
                      onChange={(e) =>
                        updateAsset(asset.id, "serialNumber", e.target.value)
                      }
                      placeholder="Enter serial #"
                      className="h-8 w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={asset.condition}
                      onValueChange={(value: AssetCondition) =>
                        updateAsset(asset.id, "condition", value)
                      }
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assetConditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            <span className={`px-2 py-0.5 rounded text-xs ${conditionColors[condition.value]}`}>
                              {condition.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={asset.notes}
                      onChange={(e) =>
                        updateAsset(asset.id, "notes", e.target.value)
                      }
                      placeholder="Add notes..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    {asset.id.startsWith("custom-") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Custom Asset */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Input
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              placeholder="Add custom asset..."
              className="flex-1"
            />
            <Select
              value={newAssetType}
              onValueChange={(value: AssetType) => setNewAssetType(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(assetTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addAsset} disabled={!newAssetName.trim()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
