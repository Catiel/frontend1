import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";

const RatingsView = ({ onBack = () => {}, managementId }) => {
    const [formValues, setFormValues] = useState({
        sprint_points: "",
        cross_evaluation_points: "",
        proposal_points: "",
        sprint_teacher_percentage: "",
        sprint_self_percentage: "",
        sprint_peer_percentage: "",
        proposal_part_a_percentage: "",
        proposal_part_b_percentage: "",
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(true); // Controla el estado del diálogo
    const { toast } = useToast();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (!value || (/^[0-9]*$/.test(value) && value >= 1 && value <= 100)) {
            setFormValues((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    useEffect(() => {
        const {
            sprint_points,
            cross_evaluation_points,
            proposal_points,
            sprint_teacher_percentage,
            sprint_self_percentage,
            sprint_peer_percentage,
            proposal_part_a_percentage,
            proposal_part_b_percentage,
        } = formValues;

        const sprintPoints = parseInt(sprint_points) || 0;
        const crossEvaluationPoints = parseInt(cross_evaluation_points) || 0;
        const proposalPoints = parseInt(proposal_points) || 0;
        const sprintTeacherPercentage = parseInt(sprint_teacher_percentage) || 0;
        const sprintSelfPercentage = parseInt(sprint_self_percentage) || 0;
        const sprintPeerPercentage = parseInt(sprint_peer_percentage) || 0;
        const proposalPartAPercentage = parseInt(proposal_part_a_percentage) || 0;
        const proposalPartBPercentage = parseInt(proposal_part_b_percentage) || 0;

        const valid =
            sprintPoints + crossEvaluationPoints + proposalPoints === 100 &&
            sprintTeacherPercentage + sprintSelfPercentage + sprintPeerPercentage === 100 &&
            proposalPartAPercentage + proposalPartBPercentage === 100;

        setIsFormValid(valid);
    }, [formValues]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast({
                title: "Error",
                description: "Las sumas de los puntos y porcentajes deben ser igual a 100.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await postData(`/managements/${managementId}/score`, formValues);

            if (response && response.success) {
                toast({
                    title: "Configuración Enviada",
                    description: "La configuración de puntuación se guardó correctamente.",
                    variant: "success",
                    className: "bg-green-500 text-white",
                });
                setTimeout(() => {
                    setIsDialogOpen(false);
                    onBack();
                }, 500);
            } else {
                toast({
                    title: "Error al Enviar",
                    description: "Hubo un problema al enviar la configuración. Intenta de nuevo.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error de Conexión",
                description: "Hubo un error al intentar realizar la solicitud. Intenta nuevamente.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-lg mx-auto overflow-y-auto max-h-[80vh] p-6">
                <h1 className="text-purple-700 font-bold text-2xl mb-6">Configurar Ponderaciones</h1>

                <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
                    {/* Puntos de Evaluación */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-purple-700">Puntos de Evaluación</h2>
                        <p className="text-sm text-red-600">
                            La suma total debe ser igual a 100 para ser valido.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Puntos de Sprint</label>
                            <Input
                                name="sprint_points"
                                type="number"
                                value={formValues.sprint_points}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Puntos de Evaluación Cruzada</label>
                            <Input
                                name="cross_evaluation_points"
                                type="number"
                                value={formValues.cross_evaluation_points}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Puntos de Propuesta</label>
                            <Input
                                name="proposal_points"
                                type="number"
                                value={formValues.proposal_points}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                    </div>

                    {/* Porcentajes de Sprint */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-purple-700">Porcentajes de Sprint</h2>
                        <p className="text-sm text-red-600">
                            La suma total debe ser igual a 100 para ser valido.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Porcentaje de Sprint (Profesor)</label>
                            <Input
                                name="sprint_teacher_percentage"
                                type="number"
                                value={formValues.sprint_teacher_percentage}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Porcentaje de Sprint (Autoevaluación)</label>
                            <Input
                                name="sprint_self_percentage"
                                type="number"
                                value={formValues.sprint_self_percentage}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Porcentaje de Sprint (Evaluación de Pares)</label>
                            <Input
                                name="sprint_peer_percentage"
                                type="number"
                                value={formValues.sprint_peer_percentage}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                    </div>

                    {/* Porcentajes de Propuesta */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-purple-700">Porcentajes de Propuesta</h2>
                        <p className="text-sm text-red-600">
                            La suma total debe ser igual a 100 para ser valido.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Porcentaje Parte A Propuesta</label>
                            <Input
                                name="proposal_part_a_percentage"
                                type="number"
                                value={formValues.proposal_part_a_percentage}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">Porcentaje Parte B Propuesta</label>
                            <Input
                                name="proposal_part_b_percentage"
                                type="number"
                                value={formValues.proposal_part_b_percentage}
                                onChange={handleInputChange}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="bg-purple-600 text-white" disabled={!isFormValid}>
                        Guardar Configuración
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RatingsView;
