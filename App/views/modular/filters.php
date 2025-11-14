<div class="overlay">

    <div id="filtersModal" class="modalContainer">
        <div class="d-flex justify-content-end">
            <button id="closeModal" type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
        </div>
        <h1 class="modalTitle">Filtros</h1>
        <hr class="whiteGreyText">
        <form action="/results" method="get" accept-charset="UTF-8" id="filterForm">
        <!-- NOTA: Categorías -->
            <div id="byCategory" class="p-3">
                <label for="tagSelected" class="sectionTitle">Buscar por categorías</label>
                <div class="d-flex">
                    <select id="tagSelected" class="w-100 offside-regular">
                        <option value="">Selecciona una categoría</option>
                    </select>
                    <button type="button" class="noBackground noBorder addCatIcon x-largeText aliceblueText"><i class="bi bi-plus-square"></i></button>
                </div>
                <div id="listCategories" name="listCategories" class="previewList">
                    <!-- Categorías seleccionadas se mostrarán aquí -->
                </div>
            </div>
            <hr class="whiteGreyText">    

            <!--NOTA: Fechas -->
            <div id="byDate">
              <label class="sectionTitle">Buscar por fechas</label>
                <div class="d-flex justify-content-center">
                    <div class="date-group">
                        <label for="sinceDate" class="whiteGreyText text-center">Desde</label>
                        <input type="date" id="sinceDate" name="sinceDate" class="dateInput">
                    </div>
                    <span class="date-separator whiteGreyText">–</span>
                    <div class="date-group">
                      <label for="toDate" class="whiteGreyText text-center">Hasta</label>
                      <input type="date" id="toDate" name="toDate" class="dateInput">
                    </div>
                </div>
            </div>
            <hr class="whiteGreyText"> 

            <!-- NOTA: Sede -->
            <div id="byCountries">
              <label for= "countrySelect" class="sectionTitle">Sede </label>
                <div class="d-flex">
                    <img id="miniFlag" class="miniFlag" style="display: none;">
                    <select id="countrySelect" class="offside-regular w-80 d-block mx-auto">
                        <option value="">Selecciona una sede</option>
                    </select>
                </div>
            </div>
            <hr class="whiteGreyText">   

            <!-- NOTA: Selección -->
            <div id="bySelection">
                <div class="checkbox-group">
                    <input type="checkbox" id="bySelection" name="bySelection">
                    <label for="bySelection" class="sectionTitle">Por selección</label>
                </div>
                <div class="d-flex">
                    <img id="natFlag" class="miniFlag" style="display: none;">
                    <select id="nationalitySelect" class="offside-regular w-80 d-block mx-auto">
                        <option value="">Selecciona una selección</option>
                    </select>
                </div>
            </div>
            <hr class="whiteGreyText">  

            <!-- NOTA: Mundial -->
            <div id="byMundialYear">
              <div class="checkbox-group">
                <input type="checkbox" id="byMundial" name="byMundial">
                <label for="byMundial" class="sectionTitle">Mundiales</label>
              </div>
              <select id="selectYear" class="offside-regular w-80 d-block mx-auto">
                <option value="">Selecciona un mundial</option>
              </select>
            </div>
            <hr class="whiteGreyText">  

            <!-- NOTA: Orden -->
            <div id="orderBy">
                <label for="orderSelect" class="sectionTitle">Ordenar publicaciones por</label>
                <select id="orderSelect" class="offside-regular w-80 d-block mx-auto">
                    <option value="newest">Más recientes primero</option>
                    <option value="oldest">Más antiguos primero</option>
                    <option value="most_liked">Más upvotes</option>
                    <option value="most_comments">Más comentarios</option>
                </select>
            </div>
            <br>
            <button type="submit" id="applyFilters" class="btn btn-secondary d-block mx-auto mb-5 syncopate-regular shadow blackText">Buscar</button>
        </form>
    </div>
</div>