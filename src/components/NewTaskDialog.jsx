import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;

export default function NewTaskDialog({ isOpen, onClose, newTask, setNewTask, addNewTask, teamMembers }) {
    const [errors, setErrors] = useState({});

    const handleAddTask = () => {
        const validationErrors = {};
        if (newTask.title?.length === 0) validationErrors.title = "El título es obligatorio";
        if (newTask.title?.length > TITLE_MAX_LENGTH) validationErrors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
        if (newTask.description?.length > DESCRIPTION_MAX_LENGTH) validationErrors.description = `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres`;
        if (!newTask.assignee) validationErrors.assignee = "Debe asignar la tarea a un miembro del equipo";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        addNewTask();
        setErrors({});
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-purple-600">Agregar Nueva Tarea</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskTitle" className="text-right">Título</Label>
                        <Input
                            id="taskTitle"
                            value={newTask.title || ''}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className={`col-span-3 ${errors.title ? 'border-red-500' : ''}`}
                            maxLength={TITLE_MAX_LENGTH}
                        />
                        {errors.title && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.title}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="taskDescription" className="text-right pt-2">Descripción</Label>
                        <div className="col-span-3">
                            <textarea
                                id="taskDescription"
                                value={newTask.description || ''}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className={`w-full px-3 py-2 text-sm rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                rows={4}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskAssignee" className="text-right">Asignar a</Label>
                        <Select onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                            <SelectTrigger className={`col-span-3 ${errors.assignee ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Seleccionar miembro" />
                            </SelectTrigger>
                            <SelectContent>
                                {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id.toString()}>
                                        {member.name} {member.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.assignee && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.assignee}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">Cancelar</Button>
                    <Button onClick={handleAddTask} className="bg-purple-600 text-white hover:bg-purple-700">Agregar Tarea</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}