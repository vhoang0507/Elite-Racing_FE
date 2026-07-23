import { useRef, useState } from 'react';

import { FaCloudUploadAlt, FaImage, FaTrashAlt } from 'react-icons/fa';

import { tournamentImageAccept } from './createTournamentHelpers';

// Drag-and-drop tournament cover image picker. The selected File object is
// handed back to the parent via onFileSelected/onFileRemoved - it is never
// uploaded here. The parent still attaches it to the multipart FormData at
// submit time, exactly like the previous plain <input type="file">.
function TournamentImageUpload({
    id,
    fileName,
    previewUrl,
    errorMessage,
    onFileSelected,
    onFileRemoved,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const openFilePicker = () => inputRef.current?.click();

    const handleFiles = (fileList) => {
        const file = fileList?.[0];

        if (file) {
            onFileSelected(file);
        }
    };

    return (
        <div className="grid gap-2">
            <input
                accept={tournamentImageAccept}
                className="sr-only"
                id={id}
                onChange={(event) => handleFiles(event.target.files)}
                ref={inputRef}
                type="file"
            />

            {previewUrl ? (
                <div className="relative overflow-hidden rounded-md border border-[var(--admin-border)]">
                    <img alt="Tournament cover preview" className="h-32 w-full object-cover" src={previewUrl} />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[rgba(15,23,42,0.55)] px-3 py-2">
                        <span className="min-w-0 truncate text-[0.78rem] font-semibold text-white">{fileName}</span>
                        <div className="flex flex-none items-center gap-2">
                            <button
                                className="inline-flex h-7 items-center rounded-full bg-white/90 px-3 text-[0.7rem] font-[850] text-[#16305c] hover:bg-white"
                                onClick={openFilePicker}
                                type="button"
                            >
                                Replace
                            </button>
                            <button
                                aria-label="Remove tournament image"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#a4392f] hover:bg-white"
                                onClick={onFileRemoved}
                                type="button"
                            >
                                <FaTrashAlt aria-hidden="true" className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    aria-describedby={`${id}-hint`}
                    className={`grid cursor-pointer place-items-center gap-1 rounded-md border-2 border-dashed px-4 py-3.5 text-center transition-colors ${isDragging ? 'border-[#0b7f5a] bg-[#eefaf3]' : 'border-[var(--admin-border)] bg-[#fffdfc] hover:bg-[#f8fbf9]'}`}
                    onClick={openFilePicker}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        handleFiles(event.dataTransfer.files);
                    }}
                    type="button"
                >
                    {isDragging ? (
                        <FaCloudUploadAlt aria-hidden="true" className="h-4 w-4 text-[#0b7f5a]" />
                    ) : (
                        <FaImage aria-hidden="true" className="h-4 w-4 text-[#9b7771]" />
                    )}
                    <span className="text-[0.8rem] font-[750] text-[#5b403c]">
                        Drag &amp; drop an image, or click to browse
                    </span>
                    <span className="text-[0.7rem] font-semibold text-[#94a3b8]" id={`${id}-hint`}>
                        JPG, PNG or WEBP - up to 5MB - recommended 1200x600px
                    </span>
                </button>
            )}

            {errorMessage && (
                <span className="text-[0.76rem] font-[700] text-[#c65a4f]" role="alert">{errorMessage}</span>
            )}
        </div>
    );
}

export default TournamentImageUpload;
