import React, {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    LinkIcon,
    Paperclip
} from 'lucide-react';
import {Skeleton} from "@/components/ui/skeleton";
import {getData} from "../api/apiService";

const MAX_CONTENT_LENGTH = 280;

export default function AnnouncementList({managementId}) {
    const [announcements, setAnnouncements] = useState([]);
    const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
    });

    useEffect(() => {
        fetchAnnouncements(managementId, 1);
    }, [managementId]);

    const fetchAnnouncements = async (managementId, page = 1) => {
        setIsLoading(true);
        try {
            const url = `/management/${managementId}/announcements?page=${page}`;
            const announcementsResponse = await getData(url);

            if (announcementsResponse && announcementsResponse.data) {
                const rawData = announcementsResponse.data;

                const announcementsArray =
                    Array.isArray(rawData) ? rawData : Object.values(rawData);

                setAnnouncements(announcementsArray);
                setPagination({
                    currentPage: announcementsResponse.current_page || 1,
                    lastPage: announcementsResponse.last_page || 1,
                });
            } else {
                setAnnouncements([]);
                setPagination({currentPage: 1, lastPage: 1});
            }
        } catch (error) {
            console.error("Error al obtener los anuncios:", error);
            setAnnouncements([]);
            setPagination({currentPage: 1, lastPage: 1});
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpanded = (id) => {
        setExpandedAnnouncements((prev) =>
            prev.includes(id) ? prev.filter((annId) => annId !== id) : [...prev, id]
        );
    };

    const sanitizeContent = (content) => {
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
            ALLOWED_ATTR: ["href", "target", "rel"],
        });
    };

    const truncateContent = (content, isExpanded) => {
        return content.length > MAX_CONTENT_LENGTH && !isExpanded
            ? `${content.slice(0, MAX_CONTENT_LENGTH)}...`
            : content;
    };

    const renderFilePreview = (file) => {
        if (file.mime_type && file.mime_type.startsWith("image/")) {
            return (
                <div className="relative group overflow-hidden rounded-lg aspect-w-16 aspect-h-10">
                    <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-xs sm:text-sm md:text-base font-medium rounded-md px-2 py-1 sm:px-3 sm:py-1"
                        >
                            Ver imagen
                        </a>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderLinkPreview = (link) => {
        return link.image ? (
            <div className="relative group overflow-hidden rounded-lg aspect-w-16 aspect-h-10">
                <img
                    src={link.image}
                    alt={link.title || "Preview"}
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-xs sm:text-sm md:text-base font-medium rounded-md px-2 py-1 sm:px-3 sm:py-1"
                    >
                        {link.title || "Ver enlace"}
                    </a>
                </div>
            </div>
        ) : null;
    };

    const renderYouTubeVideos = (videos) => {
        return videos.map((video, index) => (
            <div
                key={`youtube-video-${index}`}
                className="relative group overflow-hidden rounded-lg aspect-w-16 aspect-h-10"
            >
                <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-xs sm:text-sm md:text-base font-medium rounded-md px-2 py-1 sm:px-3 sm:py-1"
                    >
                        Ver video
                    </a>
                </div>
            </div>
        ));
    };

    const renderNonPreviewFile = (file) => (
        <div
            className="flex items-center gap-2 bg-gray-50 p-2 sm:p-3 rounded-lg shadow-sm transition-shadow duration-200">
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0"/>
            <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm md:text-base text-purple-700 truncate flex-grow rounded-md"
            >
                {file.name || "Archivo"}
            </a>
        </div>
    );

    const renderNonPreviewLink = (link) => (
        <div
            className="flex items-center gap-2 bg-gray-50 p-2 sm:p-3 rounded-lg shadow-sm transition-shadow duration-200">
            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0"/>
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm md:text-base text-purple-700 truncate flex-grow rounded-md"
            >
                {link.title || "Enlace"}
            </a>
        </div>
    );

    const renderAnnouncementContent = (announcement, isExpanded) => {
        const content = truncateContent(announcement.content, isExpanded);
        const previewFiles = announcement.files?.filter(file => file.mime_type && file.mime_type.startsWith("image/")) || [];
        const nonPreviewFiles = announcement.files?.filter(file => !file.mime_type || !file.mime_type.startsWith("image/")) || [];
        const previewLinks = announcement.links?.filter(link => link.image) || [];
        const nonPreviewLinks = announcement.links?.filter(link => !link.image) || [];
        const youtubeVideos = announcement.youtube_videos || [];

        return (
            <>
                <div
                    className={`text-gray-700 mb-4 text-xs sm:text-sm md:text-base leading-relaxed max-w-full ${isExpanded ? "" : "line-clamp-3"}`}
                    style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{__html: sanitizeContent(content)}}
                />

                {(previewFiles.length > 0 || previewLinks.length > 0 || youtubeVideos.length > 0) && (
                    <div className="mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {previewFiles.map((file, index) => (
                                <div key={`file-preview-${index}`} className="aspect-w-16 aspect-h-10">
                                    {renderFilePreview(file)}
                                </div>
                            ))}
                            {previewLinks.map((link, index) => (
                                <div key={`link-preview-${index}`} className="aspect-w-16 aspect-h-10">
                                    {renderLinkPreview(link)}
                                </div>
                            ))}
                            {renderYouTubeVideos(youtubeVideos)}
                        </div>
                    </div>
                )}

                {(nonPreviewFiles.length > 0 || nonPreviewLinks.length > 0) && (
                    <div className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {nonPreviewFiles.map((file, index) => (
                                <div key={`file-${index}`}>{renderNonPreviewFile(file)}</div>
                            ))}
                            {nonPreviewLinks.map((link, index) => (
                                <div key={`link-${index}`}>{renderNonPreviewLink(link)}</div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderPagination = () => {
        if (pagination.lastPage <= 1) {
            return null;
        }

        const getPageRange = () => {
            const totalVisible = 5;
            const half = Math.floor(totalVisible / 2);
            let start = Math.max(1, pagination.currentPage - half);
            let end = Math.min(pagination.lastPage, start + totalVisible - 1);

            if (end - start + 1 < totalVisible) {
                start = Math.max(1, end - totalVisible + 1);
            }

            return Array.from({length: end - start + 1}, (_, i) => start + i);
        };

        const pages = getPageRange();

        return (
            <nav className="flex items-center justify-center mt-6 space-x-1" aria-label="Paginación">
                <Button
                    onClick={() => fetchAnnouncements(managementId, pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1 text-sm font-medium text-purple-600 bg-white border border-purple-300 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                {pages.map((page) => (
                    <Button
                        key={page}
                        onClick={() => fetchAnnouncements(managementId, page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                            pagination.currentPage === page
                                ? "bg-purple-600 text-white"
                                : "text-purple-600 bg-white border border-purple-300 hover:bg-purple-50"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                        aria-label={`Página ${page}`}
                        aria-current={pagination.currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </Button>
                ))}
                <Button
                    onClick={() => fetchAnnouncements(managementId, pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="px-2 py-1 text-sm font-medium text-purple-600 bg-white border border-purple-300 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Página siguiente"
                >
                    <ChevronRight className="w-5 h-5"/>
                </Button>
            </nav>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {renderPagination()}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="p-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full"/>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[200px]"/>
                                        <Skeleton className="h-4 w-[150px]"/>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-full mb-2"/>
                                <Skeleton className="h-4 w-full mb-2"/>
                                <Skeleton className="h-4 w-2/3"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : announcements.length > 0 ? (
                announcements.map((announcement) => {
                    const isExpanded = expandedAnnouncements.includes(announcement.id);

                    return (
                        <Card
                            key={`${announcement.id}-${announcement.created_at}`}
                            className="overflow-hidden border-2 border-purple-200 shadow-sm"
                        >
                            <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar
                                            className="h-10 w-10 bg-purple-600 text-white border-2 border-purple-300">
                                            <AvatarImage
                                                src={announcement.user?.avatar || "/placeholder.svg"}
                                                alt={`${announcement.user?.name || 'Usuario'} ${announcement.user?.last_name || ''}`}
                                            />
                                            <AvatarFallback
                                                className="text-purple-600 bg-purple-200 text-sm sm:text-base md:text-lg">
                                                {announcement.user?.name?.charAt(0).toUpperCase() || "U"}
                                                {announcement.user?.last_name?.charAt(0).toUpperCase() || "D"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                                                {announcement.user?.name
                                                    ? `${announcement.user.name} ${announcement.user.last_name}`
                                                    : "Usuario Desconocido"}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1"/>
                                                Publicado
                                                el: {new Date(announcement.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 border border-purple-200 cursor-default"
                                    >
                                        {announcement.is_global ? "Global" : "Grupo"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4">
                                {renderAnnouncementContent(announcement, isExpanded)}

                                {announcement.content.length > MAX_CONTENT_LENGTH && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(announcement.id)}
                                        className="mt-2 text-xs sm:text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded"
                                    >
                                        {isExpanded ? (
                                            <>
                                                Menos <ChevronUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4"/>
                                            </>
                                        ) : (
                                            <>
                                                Más <ChevronDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4"/>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <Card className="overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-12 h-12 text-purple-300 mb-4"/>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay anuncios disponibles</h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            Actualmente no hay anuncios para mostrar. Los nuevos anuncios aparecerán aquí cuando
                            estén disponibles.
                        </p>
                    </CardContent>
                </Card>
            )}
            {renderPagination()}
        </div>
    );
}