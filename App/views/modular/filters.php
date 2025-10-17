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
                        <option id="cat1" name="cat1" class="selectOpt smallText">#Jugadas</option>
                        <option id="cat2" name="cat2" class="selectOpt smallText">#Entrevistas</option>
                        <option id="cat3" name="cat3" class="selectOpt smallText">#Asistentes</option>
                    </select>
                    <button type="button" class="noBackground noBorder addCatIcon x-largeText aliceblueText"><i class="bi bi-plus-square"></i></button>
                </div>
                <div id="listCategories" name="listCategories" class="previewList">
                    <div id="addedCategory" name="addedCategory" class="d-flex align-items-center height50x">
                        <p class="showListElement shadow smallerText">#hola</p>
                        <button type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
                    </div>
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
                    <img id="miniFlag" class="miniFlag">
                    <select id="countrySelect" class="offside-regular w-80 d-block mx-auto">
                        <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt smallText">Canadá</option>
                        <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt smallText">México</option>
                        <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt smallText">Estados Unidos</option>
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
                    <img id="natFlag" class="miniFlag">
                    <select id="nationalitySelect" class="offside-regular w-80 d-block mx-auto">
                        <option id="flag-Can" name="flag-Can" data-image="/media/Flags/Canada-Emoji.png" class="selectOpt smallText">Canadiense</option>
                        <option id="flag-Mex" name="flag-Mex" data-image="/media/Flags/Mexico-Emoji.png" class="selectOpt smallText">Mexicano</option>
                        <option id="flag-EU" name="flag-EU" data-image="/media/Flags/US-Emoji.png" class="selectOpt smallText">Estadounidense</option>
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
                <option class="selectOpt smallText">1930</option>
                <option class="selectOpt smallText">1934</option>
                <option class="selectOpt smallText">1938</option>
              </select>
            </div>
            <hr class="whiteGreyText">  

            <!-- NOTA: Orden -->
            <div id="orderBy">
                <label for="orderSelect" class="sectionTitle">Ordenar mundiales por</label>
                <select id="tagSelected" class="offside-regular w-80 d-block mx-auto">
                    <option class="selectOpt smallText">Más recientes primero</option>
                    <option class="selectOpt smallText">Más antiguos primero</option>
                    <option class="selectOpt smallText">Por país (A-Z)</option>
                    <option class="selectOpt smallText">Por país (Z-A)</option>
                    <option class="selectOpt smallText">Más upvotes</option>
                    <option class="selectOpt smallText">Más comentarios</option>
                </select>
            </div>
            <br>
            <button type="submit" id="applyFilters" class="btn btn-secondary d-block mx-auto mb-5 syncopate-regular shadow blackText">Buscar</button>
        </form>
    </div>
</div>