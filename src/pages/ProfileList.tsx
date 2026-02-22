import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profilesApi, type GetProfilesParams, type Profile } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, Trash2, Pencil, User } from "lucide-react";

export default function ProfileList() {
  const navigate = useNavigate();
  const { userId: currentUserId, setCurrentUser } = useCurrentUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<{
    male: number;
    female: number;
    other: number;
  }>();

  const [params, setParams] = useState<GetProfilesParams>({
    page: 1,
    limit: 10,
    search: "",
    gender: undefined,
    minAge: undefined,
    maxAge: undefined,
    sortBy: "createdAt",
    orderBy: "desc",
  });
  console.log(import.meta.env.VITE_API_URL);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await profilesApi.getProfiles(params);
      setProfiles(data.items);
      setTotalPages(data.totalPages);
      setStats(data.statsAll);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      await profilesApi.deleteProfile(id);
      loadProfiles();
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground">Manage user profiles</p>
        </div>
        <div className="flex gap-2">
          {currentUserId && (
            <Card className="px-4 py-2">
              <p className="text-sm text-muted-foreground">Current User:</p>
              <p className="font-medium">
                {profiles.find((p) => p.id === currentUserId)?.name ||
                  "Unknown"}
              </p>
            </Card>
          )}
          <Button onClick={() => navigate("/profiles/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Male</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.male}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Female</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.female}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Other</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.other}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={params.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={params.gender}
              onValueChange={(value) => {
                const gender =
                  value === "all"
                    ? undefined
                    : (value as "male" | "female" | "other");
                setParams({ ...params, gender, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.sortBy}
              onValueChange={(value) => {
                const sortBy = value as "createdAt" | "age" | "name";
                setParams({ ...params, sortBy, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="age">Age</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow
                      key={profile.id}
                      className={
                        profile.id === currentUserId ? "bg-primary/5" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {profile.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {profile.name}
                          {profile.id === currentUserId && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{profile.age}</TableCell>
                      <TableCell>
                        {profile.gender === "male"
                          ? "Male"
                          : profile.gender === "female"
                            ? "Female"
                            : "Other"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {profile.bio}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {profile.id !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentUser(profile.id)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Use as Me
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/profiles/edit/${profile.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(profile.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {params.page} / {totalPages}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page === 1}
                    onClick={() =>
                      setParams({ ...params, page: params.page! - 1 })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page === totalPages}
                    onClick={() =>
                      setParams({ ...params, page: params.page! + 1 })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
