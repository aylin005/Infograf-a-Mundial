<div class="overlay" style="display: none; z-index: 9999;">
    <div id="likesModal" class="modalContainer p-0 noScrollY" style="z-index: 10000;">
        <div class="d-flex justify-content-end p-3">
            <button id="closeModal" type="button" class="addButton noBackground noBorder"><i class="bi bi-x-square deleteIcon"></i></button>
        </div>

        <ul class="nav nav-tabs" data-bs-theme="dark">
            <li class="nav-item">
                <a class="nav-link active py-0" data-bs-toggle="tab" aria-current="page" href="#upvotesContainer" role="tab">
                    <div class="d-flex showCalif p-0">
                        <button id="upVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-up-square my-1 goodVoteIcon"></i></button> 
                        <p id="upVote" class="syncopate-regular m-2 rem0d5Text">4M</p>
                    </div>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link py-0" data-bs-toggle="tab" href="#downVotesContainer" role="tab">
                    <div class="d-flex showCalif p-0">
                        <button id="downVoteButton" class="noBackground noBorder transparentButton"><i class="bi bi-arrow-down-square my-1 badVoteIcon"></i></button>
                        <p id="downVote" class="syncopate-regular m-2 rem0d5Text">66</p>
                    </div>
                </a>
            </li>
        </ul>

        <div class="tab-content">
            <div class="tab-pane fade show active" id="upvotesContainer" role="tabpanel">
                <div id="upvotesListContainer" class="scrollY p-2">
                    <!-- Los usuarios con upvote se cargarán aquí -->
                </div>
            </div>
            <div class="tab-pane fade" id="downVotesContainer" role="tabpanel">
                <div id="downvotesListContainer" class="scrollY p-2">
                    <!-- Los usuarios con downvote se cargarán aquí -->
                </div>
            </div>
        </div>
    </div>
</div>