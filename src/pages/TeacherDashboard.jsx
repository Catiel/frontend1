import React, {useState} from "react";
import LayoutTeacher from "../components/LayoutTeacher";
import DashboardTeacher from "../components/DashboardTeacher";
import Perfil from "../components/Perfil";
import TeamsTable from "@/components/TeamsTable";
import ManagementHistory from "../components/ManagementHistory";

export default function TeacherDashboard() {
    const [currentView, setCurrentView] = useState("inicio");

    const renderContent = () => {
        switch (currentView) {
            case "inicio":
                return <DashboardTeacher/>;
            case "gestiones":
                return <ManagementHistory/>;
            case "perfil":
                return <Perfil/>;
            case "empresas":
                return <TeamsTable/>;
            default:
                return <DashboardTeacher/>;
        }
    };

    return (<LayoutTeacher setCurrentView={setCurrentView}>
        {renderContent()}
    </LayoutTeacher>);
}