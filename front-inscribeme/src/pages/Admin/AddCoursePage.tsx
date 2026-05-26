import { useState } from "react";

type CourseForm = {
    title: string;
    category: string;
    instructor: string;
    price: string;
    slots: string;
    startDate: string;
    imageUrl: string;
    description: string;
};

const AddCoursePage = () => {
    const [formData, setFormData] = useState<CourseForm>({
        title: "",
        category: "",
        instructor: "",
        price: "",
        slots: "",
        startDate: "",
        imageUrl: "",
        description: "",
    });

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Curso agregado:", formData);

        alert("Curso agregado correctamente");

        setFormData({
            title: "",
            category: "",
            instructor: "",
            price: "",
            slots: "",
            startDate: "",
            imageUrl: "",
            description: "",
        });
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] px-6 py-12 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                <div className="mb-10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#FFA000]">
                        Administración de cursos
                    </p>

                    <h1 className="text-3xl font-bold text-[#37474F] md:text-4xl">
                        Agregar nuevo curso
                    </h1>

                    <p className="mt-3 max-w-2xl text-[#455A64]">
                        Completa la información necesaria para publicar un nuevo curso en la
                        plataforma Inscríbeme.
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Nombre del curso
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ej: React desde cero"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Categoría
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    <option value="programacion">Programación</option>
                                    <option value="diseño">Diseño</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="negocios">Negocios</option>
                                    <option value="idiomas">Idiomas</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Instructor
                                </label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                    placeholder="Ej: Gonzalo Catrilef"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Precio
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Ej: 25000"
                                    min="0"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Cupos disponibles
                                </label>
                                <input
                                    type="number"
                                    name="slots"
                                    value={formData.slots}
                                    onChange={handleChange}
                                    placeholder="Ej: 30"
                                    min="1"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                    Fecha de inicio
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                URL de imagen
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Ej: https://ejemplo.com/curso.jpg"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                                Descripción del curso
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe brevemente el contenido del curso..."
                                rows={5}
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                className="rounded-xl border border-[#455A64] px-6 py-3 font-semibold text-[#455A64] transition hover:bg-[#ECEFF1]"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="rounded-xl bg-[#FFA000] px-6 py-3 font-bold text-[#212121] shadow-md transition hover:bg-[#ffb300]"
                            >
                                Guardar curso
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default AddCoursePage;