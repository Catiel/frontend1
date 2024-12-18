import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  ChartNoAxesCombined,
  Check,
  Copy,
  Edit2,
  Hash,
  Mail,
  Phone,
  Settings,
  FileText ,
  X,
  Link,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { postData, putData,getData } from "../api/apiService";
import ImageCropper from "./ImageCropper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LinksManagerModal from "./LinksManagerModal";
import ProposalModal from './ProposalModal';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function GroupDetailCreator({
  initialGroupData,
  onUpdateGroup,
}) {
  const [groupData, setGroupData] = useState(initialGroupData);
  const [errors, setErrors] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalStatus, setProposalStatus] = useState(null);  // Estado para el estado de las propuestas

  useEffect(() => {
    const fetchProposalStatus = async () => {
      try {
        const response = await getData("/proposal-submission");
        if (response.success) {
          setProposalStatus(response.data);  // Guardamos el estado de las propuestas
          const { part_a, part_b } = response.data;
          if (part_a.status === "pending" || part_b.status === "pending") {
            setIsProposalModalOpen(true); // Abrir el modal si alguna parte está pendiente
          }
        } else {
          toast({
            title: "Error",
            description: "Error al obtener el estado de las propuestas.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al obtener el estado:", error);
        toast({
          title: "Error",
          description: "Hubo un error al intentar obtener el estado de las propuestas.",
          variant: "destructive",
        });
      }
    };

    fetchProposalStatus();
  }, []);


  useEffect(() => {
    setGroupData(initialGroupData);
  }, [initialGroupData]);

  const validateField = (field, value) => {
    if (!value.trim()) {
      return "Este campo no puede estar vacío";
    }
    if (field === "contact_phone" && !/^[467]\d{7}$/.test(value)) {
      return "Ingrese un número válido de Bolivia (8 dígitos, comenzando con 4, 6 o 7)";
    }
    if (
      field === "contact_email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      return "Ingrese un correo electrónico válido";
    }
    return null;
  };

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    setGroupData((prevData) => ({
      ...prevData,
      [editingField]: initialGroupData[editingField],
    }));
    setEditingField(null);
    setErrors({});
  };

  const handleSave = async (field) => {
    const newValue = groupData[field];
    const error = validateField(field, newValue);
    if (error) {
      setErrors({ [field]: error });
      return;
    }

    try {
      const response = await putData("/groups/contact-info", {
        [field]: newValue,
      });
      if (response.success) {
        setGroupData((prevData) => ({
          ...prevData,
          [field]: newValue,
        }));
        toast({
          title: "Éxito",
          description: "Información actualizada exitosamente.",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
        setEditingField(null);
        onUpdateGroup({ ...groupData, [field]: newValue });
      } else {
        toast({
          title: "Error",
          description:
            response.message || "No se pudo actualizar la información.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error al actualizar la información:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la información.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors({});
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copiado",
          description: "Código copiado al portapapeles",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      },
      (err) => {
        console.error("Error al copiar: ", err);
      },
    );
  };

  const handleLogoEdit = () => {
    setIsLogoDialogOpen(true);
  };

  const handleLogoSave = async () => {
    if (croppedImage) {
      try {
        if (croppedImage.size > MAX_FILE_SIZE) {
          toast({
            title: "Error",
            description: "El tamaño del logo no debe superar los 10MB.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        const formData = new FormData();
        formData.append("logo", croppedImage, "logo.png");
        formData.append("_method", "PUT");

        const response = await postData("/groups/contact-info", formData);
        if (response.success) {
          const newLogoUrl =
            response.data?.logo_url || URL.createObjectURL(croppedImage);
          setGroupData((prevData) => ({
            ...prevData,
            logo: newLogoUrl,
          }));
          toast({
            title: "Éxito",
            description: "Logo actualizado exitosamente.",
            duration: 3000,
            className: "bg-green-500 text-white",
          });
          onUpdateGroup({ ...groupData, logo: newLogoUrl });
        } else {
          toast({
            title: "Error",
            description: response.message || "No se pudo actualizar el logo.",
            variant: "destructive",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Error al actualizar el logo:", error);
        toast({
          title: "Error",
          description:
            "Ocurrió un error al actualizar el logo. Por favor, inténtelo de nuevo.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
    setIsLogoDialogOpen(false);
  };

  const handleImageCropped = (croppedImageBlob) => {
    setCroppedImage(croppedImageBlob);
  };

  const renderEditableField = (field, icon) => {
    const isEditing = editingField === field;
    const displayValue = groupData[field] || "No especificado";
    return (
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 transition-all duration-300 hover:bg-gray-200">
        {icon}
        {isEditing ? (
          <div className="flex-grow flex items-center space-x-2">
            <Input
              type={field === "contact_email" ? "email" : "tel"}
              name={field}
              value={groupData[field] || ""}
              onChange={handleInputChange}
              className="flex-grow bg-white text-gray-800 text-sm h-8 border-gray-300 focus:border-purple-400 focus:ring-purple-400"
            />
            <Button
              onClick={() => handleSave(field)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-purple-100"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              onClick={handleCancel}
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-purple-100"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-between">
            <span className="text-sm text-gray-700">{displayValue}</span>
            <Button
              onClick={() => handleEdit(field)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-purple-100"
            >
              <Edit2 className="h-4 w-4 text-purple-600" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleOpenRanking = () => setIsRankingDialogOpen(true);
  const handleCloseRanking = () => setIsRankingDialogOpen(false);

  return (
    <>
      <Card className="bg-white shadow-lg border-t-4 border-t-purple-500">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Detalles del Grupo (Creador)
          </CardTitle>
          <CardDescription className="text-gray-600">
            Información y gestión de tu grupo de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-2 border-purple-300 ring-2 ring-purple-100">
                  <AvatarImage
                    src={groupData.logo}
                    alt={groupData.short_name}
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
                    {groupData.short_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleLogoEdit}
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-0 right-0 h-6 w-6 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  {groupData.short_name}
                </h3>
                <p className="text-sm text-gray-600">{groupData.long_name}</p>
              </div>
            </div>
            <div className="space-y-2">
              {renderEditableField(
                "contact_email",
                <Mail className="h-5 w-5 text-purple-500" />,
              )}
              {errors.contact_email && (
                <p className="text-red-500 text-xs ml-7">
                  {errors.contact_email}
                </p>
              )}
              {renderEditableField(
                "contact_phone",
                <Phone className="h-5 w-5 text-purple-500" />,
              )}
              {errors.contact_phone && (
                <p className="text-red-500 text-xs ml-7">
                  {errors.contact_phone}
                </p>
              )}
              <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-700">
                    {groupData.code}
                  </span>
                </div>
                <Button
                  onClick={() => copyToClipboard(groupData.code)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <Copy className="h-4 w-4 text-purple-600" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Acciones del Grupo
            </h3>
            <p className="text-sm text-gray-600">
              Como creador del grupo, puedes gestionar la información y realizar
              acciones adicionales.
            </p>
            <div className="space-y-2">
              <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300"
                  onClick={() => setIsLinksModalOpen(true)}
              >
                <Link className="w-4 h-4 mr-2" />
                Links
              </Button>

              <LinksManagerModal
                  isOpen={isLinksModalOpen}
                  onClose={() => setIsLinksModalOpen(false)}
              />

                  <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300"
                      onClick={() => setIsProposalModalOpen(true)}  // Volver a abrir el modal
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Propuestas
                  </Button>

            </div>
          </div>
        </CardContent>
      </Card>
      <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
      />


      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Logo del Grupo</DialogTitle>
          </DialogHeader>
          <ImageCropper
            onImageCropped={handleImageCropped}
            maxFileSize={MAX_FILE_SIZE}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleLogoSave}>Guardar Logo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
