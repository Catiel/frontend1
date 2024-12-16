import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Building2, ChevronDown, Home, LogOut, Menu, User, Users} from 'lucide-react';
import {getData, postData} from "../api/apiService";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import AuthContext from "../context/AuthContext";
import EvaluationModal from "./EvaluationModal";
import EvaluationForm from "./EvaluationForm";
import CrossEvaluationModal from "./CrossEvaluationModal";
import Perfil from "./Perfil";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + " " + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
};

const menuItems = [{icon: Home, label: "Inicio", view: "inicio"}, {
    icon: Users, label: "Grupo empresa", view: "grupo"
}, {icon: Building2, label: "FundEmpresa", view: "empresas"},];

export default function Layout({children, setCurrentView}) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState("inicio");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {logout} = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [view, setView] = useState("evaluations");
    const [currentEvaluation, setCurrentEvaluation] = useState(null);
    const [crossEvaluationActive, setCrossEvaluationActive] = useState(false);
    const [crossEvaluationData, setCrossEvaluationData] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const userRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const response = await getData("/me");
            return response.data.item;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    };

    const updateUserIfChanged = (newUserData) => {
        if (newUserData && JSON.stringify(newUserData) !== JSON.stringify(userRef.current)) {
            setUser(newUserData);
            userRef.current = newUserData;
        }
    };

    useEffect(() => {
        const initialFetch = async () => {
            setIsLoading(true);
            const initialUserData = await fetchUserData();
            updateUserIfChanged(initialUserData);
            setIsLoading(false);
        };

        initialFetch();

        const intervalId = setInterval(async () => {
            const newUserData = await fetchUserData();
            updateUserIfChanged(newUserData);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMenuOpen(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchCrossEvaluation = async () => {
        try {
            const response = await getData("/cross-evaluation");
            if (response?.data) {
                setCrossEvaluationData(response.data);
                setCrossEvaluationActive(true);
            }
        } catch (error) {
            console.error("Error fetching cross evaluation:", error);
        }
    };

    useEffect(() => {
        fetchCrossEvaluation();
    }, []);

    const handleCrossEvaluationSubmit = () => {
        setCrossEvaluationActive(false);
        setCrossEvaluationData(null);
    };

    const handleLogout = async () => {
        try {
            await postData("/logout");
        } catch (error) {
            console.error("Error en la solicitud de logout:", error);
        } finally {
            logout();
        }
    };

    const handleMenuItemClick = useCallback((view) => {
        setCurrentView(view);
        setActiveView(view);
        setIsMenuOpen(false);
    }, [setCurrentView]);

    const handleEvaluationSelect = (evaluation) => {
        setCurrentEvaluation(evaluation);
        setView("form");
    };

    const handleProfileClick = () => {
        setIsProfileOpen(true);
    };

    return (<div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-purple-800 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <DropdownMenuTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Navegación</DropdownMenuLabel>
                                {menuItems.map(({icon: Icon, label, view}) => (<DropdownMenuItem
                                    key={view}
                                    onClick={() => handleMenuItemClick(view)}
                                    className={activeView === view ? "bg-purple-100" : ""}
                                >
                                    <Icon className="mr-2 h-4 w-4"/>
                                    <span>{label}</span>
                                </DropdownMenuItem>))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <h1 className="text-xl font-bold">TrackMaster</h1>
                    </div>

                    <nav className="hidden md:flex space-x-1">
                        {menuItems.map(({icon: Icon, label, view}) => (<Button
                            key={view}
                            variant="ghost"
                            onClick={() => handleMenuItemClick(view)}
                            className={`
                    flex items-center px-3 py-2 text-sm font-medium
                    ${activeView === view ? "bg-purple-700 text-white" : "text-purple-200 hover:bg-purple-700 hover:text-white"}
                  `}
                        >
                            <Icon className="mr-2 h-5 w-5"/>
                            {label}
                        </Button>))}
                    </nav>

                    {isLoading ? (<div className="flex items-center">
                        <Skeleton className="w-8 h-8 rounded-full"/>
                        <Skeleton className="h-4 w-20 ml-2"/>
                    </div>) : user ? (<DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center">
                                <Avatar className="w-8 h-8 mr-2">
                                    <AvatarImage
                                        src={user.profilePicture || getAvatarUrl(user.name, user.last_name)}
                                        alt={`${user.name} ${user.last_name}`}
                                    />
                                    <AvatarFallback className="bg-purple-200 text-purple-800 text-sm font-bold">
                                        {user.name.charAt(0)}
                                        {user.last_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="mr-1 hidden sm:inline">{user.name}</span>
                                <ChevronDown className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleProfileClick}>
                                <User className="mr-2 h-4 w-4"/>
                                <span>Editar perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4"/>
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>) : null}
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
            <div className="container mx-auto px-4 py-8">
                {crossEvaluationActive && crossEvaluationData && (<CrossEvaluationModal
                    evaluationData={crossEvaluationData}
                    onSubmit={handleCrossEvaluationSubmit}
                />)}
                {view === "evaluations" && (<EvaluationModal onEvaluationSelect={handleEvaluationSelect}/>)}
                {view === "form" && currentEvaluation ? (<EvaluationForm
                    evaluationData={currentEvaluation}
                    onBack={() => setView("evaluations")}
                />) : (view !== "form" && children)}
            </div>
        </main>

        <Perfil isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}/>
    </div>);
}