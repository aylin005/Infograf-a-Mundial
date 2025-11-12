document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const form = document.getElementById('addCategoryPost');
    const categoryInput = document.getElementById('typeCategory');
    const listContainer = document.getElementById('listCategory');
    let editingCategoryId = null;

    //cargar categorias al inicio
    loadCategories();

    //envio del formulario
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const categoryName = categoryInput.value.trim();
            
            if (!categoryName) {
                showMessage('⚠️ Por favor ingrese un nombre para la categoría', 'warning');
                return;
            }

            showCategorySpinner();

            try {
                const isEditing = editingCategoryId !== null;
                const url = '/categories';
                const data = {
                    id: isEditing ? editingCategoryId : 0,
                    name: categoryName
                };

                console.log('Enviando datos:', data);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                console.log('Respuesta del servidor:', result);

                hideCategorySpinner();

                if (result.exito) {
                    const message = isEditing ? 
                        '✅ Categoría actualizada correctamente' : 
                        '✅ Categoría creada correctamente';
                    showMessage(message, 'success');
                    
                    //limpiar formulario y reset modo edición
                    categoryInput.value = '';
                    editingCategoryId = null;
                    updateFormMode();
                    
                    //recargar lista de categorias
                    await loadCategories();
                } else {
                    showMessage('❌ Error: ' + (result.mensaje || 'No se pudo procesar la categoría'), 'error');
                }

            } catch (error) {
                console.error('Error:', error);
                hideCategorySpinner();
                showMessage('❌ Error de conexión con el servidor', 'error');
            }
        });
    }

    //cargar todas las categorías
    async function loadCategories() {
        try {
            const response = await fetch('/categories');
            const categories = await response.json();
            
            console.log('Categorías cargadas:', categories);
            renderCategories(categories);
            
        } catch (error) {
            console.error('Error cargando categorías:', error);
            showMessage('❌ Error cargando categorías', 'error');
        }
    }

    //renderizar lista de categorías
    function renderCategories(categories) {
        listContainer.innerHTML = '';

        if (!categories || categories.length === 0) {
            listContainer.innerHTML = '<p class="text-center text-muted">No hay categorías creadas</p>';
            return;
        }

        categories.forEach(category => {
            const categoryElement = createCategoryElement(category);
            listContainer.appendChild(categoryElement);
        });
    }

    //elemento HTML para una categoría
    function createCategoryElement(category) {
        const div = document.createElement('div');
        div.className = 'categoryDisplay';
        div.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-10">
                        <p class="tagTitle">#${category.name}</p>
                    </div>     
                    <div class="col-2">
                        <div class="d-flex align-items-center justify-content-center">
                            <button class="noBackground noBorder tagButton edit-btn" data-id="${category.id}" data-name="${category.name}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="noBackground noBorder tagButton deleteButton delete-btn" data-id="${category.id}">
                                <i class="bi bi-x-square"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // agregar event listeners para los botones
        const editBtn = div.querySelector('.edit-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editCategory(category.id, category.name));
        deleteBtn.addEventListener('click', () => deleteCategory(category.id, category.name));

        return div;
    }

    // Editar categoría
    function editCategory(id, name) {
        editingCategoryId = id;
        categoryInput.value = name;
        updateFormMode();
        showMessage('✏️ Editando categoría: ' + name, 'info');
    }

    // Eliminar categoría
    async function deleteCategory(id, name) {
        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/categories/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.exito) {
                showMessage('✅ Categoría eliminada correctamente', 'success');
                await loadCategories();
            } else {
                showMessage('❌ Error: ' + (result.mensaje || 'No se pudo eliminar la categoría'), 'error');
            }

        } catch (error) {
            console.error('Error eliminando categoría:', error);
            showMessage('❌ Error de conexión con el servidor', 'error');
        }
    }

    //actualizar modo del formulario (crear vs editar)
    function updateFormMode() {
        const button = document.getElementById('addCatButton');
        const input = document.getElementById('typeCategory');

        if (editingCategoryId) {
            button.innerHTML = '<i class="bi bi-check-square addCatIcon x-largeText aliceblueText"></i>';
            input.placeholder = 'Editando categoría...';
        } else {
            button.innerHTML = '<i class="bi bi-plus-square addCatIcon x-largeText aliceblueText"></i>';
            input.placeholder = 'Añade una nueva categoría aquí';
        }
    }

    //cancelar edición (tecla Esc)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && editingCategoryId) {
            editingCategoryId = null;
            categoryInput.value = '';
            updateFormMode();
            showMessage('Edición cancelada', 'info');
        }
    });

    // Funciones para manejar spinner
    function showCategorySpinner() {
        const spinner = document.getElementById('category-spinner');
        const button = document.getElementById('addCatButton');
        if (spinner && button) {
            spinner.style.display = 'block';
            button.disabled = true;
        }
    }

    function hideCategorySpinner() {
        const spinner = document.getElementById('category-spinner');
        const button = document.getElementById('addCatButton');
        if (spinner && button) {
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    //mostrar mensajes
    function showMessage(message, type = 'info') {
        const messageElement = document.getElementById('category-message');
        if (messageElement) {
            messageElement.textContent = message;
            
            //limpiar clases anteriores
            messageElement.classList.remove('text-danger', 'text-success', 'text-warning', 'text-info');
            
            switch(type) {
                case 'success':
                    messageElement.classList.add('text-success');
                    break;
                case 'error':
                    messageElement.classList.add('text-danger');
                    break;
                case 'warning':
                    messageElement.classList.add('text-warning');
                    break;
                default:
                    messageElement.classList.add('text-info');
            }

            // Mostrar con animación
            messageElement.style.display = 'block';
            messageElement.style.visibility = 'visible';
            messageElement.style.opacity = '1';
            
            // Ocultar mensaje después de 5 segundos con animación
            setTimeout(() => {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 300);
            }, 5000);
        } else {
            //fallback si no existe el elemento
            alert(message);
        }
    }
});