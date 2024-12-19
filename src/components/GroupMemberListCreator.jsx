import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { assignRole, getGroupMembers, removeMember } from "../api/groupService";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { postData } from "../api/apiService";
import InvitationList from "./InvitationList";

const roles = [
  { value: "developer", label: "Developer" },
  { value: "qa", label: "QA" },
  { value: "designer", label: "Designer" },
  { value: "product_owner", label: "Product Owner" },
  { value: "scrum_master", label: "Scrum Master" },
];

export default function GroupMemberListCreator({ groupId, members, userId }) {
  const [groupMembers, setGroupMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { toast } = useToast();
  const invitationListRef = useRef(null);

  useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    if (Array.isArray(members)) {
      setGroupMembers(members);
    }
  }, [members]);

  const fetchGroupMembers = async () => {
    setIsLoading(true);
    try {
      const response = await getGroupMembers(groupId);
      if (response.success && response.data && Array.isArray(response.data.members)) {
        setGroupMembers(response.data.members);
      } else {
        console.error("Unexpected response structure:", response);
        toast({
          title: "Error",
          description: "La estructura de la respuesta es inesperada.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los miembros del grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const response = await assignRole(memberId, newRole);
      if (response.success) {
        setGroupMembers((prevMembers) =>
            prevMembers.map((member) =>
                member.id === memberId ? { ...member, role: newRole } : member
            )
        );
        toast({
          title: "Rol actualizado",
          description: "El rol del miembro ha sido actualizado exitosamente.",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el rol del miembro.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el rol del miembro.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const response = await removeMember(memberToRemove.id);
      if (response.success) {
        setGroupMembers((prevMembers) =>
            prevMembers.filter((member) => member.id !== memberToRemove.id)
        );
        toast({
          title: "Miembro eliminado",
          description: "El miembro ha sido eliminado del grupo exitosamente.",
          className: "bg-green-500 text-white",
        });
        invitationListRef.current.fetchInvitations(); // Actualizar lista de invitaciones
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar al miembro del grupo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar al miembro del grupo.",
        variant: "destructive",
      });
    } finally {
      setMemberToRemove(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un correo electrónico válido.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingMember(true);
    try {
      const payload = {
        email: newMemberEmail,
        groupId: groupId,
      };

      const response = await postData("/invitations/send", payload);
      if (response.success) {
        setNewMemberEmail("");
        toast({
          title: "Invitación exitosa",
          description: "Se ha enviado la invitacion exitosamente.",
          className: "bg-green-500 text-white",
        });
        invitationListRef.current.fetchInvitations(); // Actualizar lista de invitaciones
      } else {
        toast({
          title: "Error",
          description: response.message || "No se pudo enviar la invitación.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding new member:", error);
      const errorMessage = error.response?.data?.message || "Ocurrió un error al enviar la invitación.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
      <Card className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <CardHeader className="bg-purple-600 py-4 px-6">
          <CardTitle className="text-xl font-bold text-white">Miembros del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(groupMembers) &&
                    groupMembers.map(
                        (member) =>
                            member &&
                            member.id && (
                                <Card
                                    key={member.id}
                                    className="bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center space-x-4 mb-4">
                                      <Avatar className="h-12 w-12 bg-purple-300">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${member.name || "Anon"} ${
                                                member.last_name || ""
                                            }`}
                                        />
                                        <AvatarFallback className="text-purple-700">
                                          {`${member.name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-grow min-w-0">
                                        <h3 className="font-medium text-purple-900 truncate">
                                          {`${member.name || "Anon"} ${member.last_name || ""}`}
                                        </h3>
                                        <p className="text-sm text-purple-600 truncate">
                                          {member.email || "No email"}
                                        </p>
                                      </div>
                                      {member.id !== userId && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => {
                                                      setMemberToRemove(member);
                                                      setIsConfirmDialogOpen(true);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 flex-shrink-0"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Eliminar miembro</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                      )}
                                    </div>
                                    <Select
                                        onValueChange={(value) => handleUpdateRole(member.id, value)}
                                        defaultValue={member.role || "no_role"}
                                    >
                                      <SelectTrigger className="w-full bg-white border-purple-300">
                                        <SelectValue placeholder="Seleccionar rol" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="no_role">Sin rol</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                              {role.label}
                                            </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </CardContent>
                                </Card>
                            )
                    )}
              </div>
          )}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Agregar nuevo miembro</h3>
            <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-grow">
                <Input
                    type="email"
                    placeholder="Email del nuevo miembro"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="pl-10 border-purple-300 focus:ring-purple-500 focus:border-purple-500 w-full"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              </div>
              <Button
                  onClick={handleAddMember}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  disabled={isAddingMember}
              >
                {isAddingMember ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isAddingMember ? "Agregando..." : "Agregar Miembro"}
              </Button>
            </div>
            <InvitationList ref={invitationListRef} groupId={groupId} />
          </div>
        </CardContent>
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Acción</DialogTitle>
            </DialogHeader>
            <p>¿Está seguro de que desea eliminar a este miembro del equipo?</p>
            <DialogFooter>
              <Button onClick={() => setIsConfirmDialogOpen(false)} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleRemoveMember} variant="destructive">
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
  );
}
