// ==============================
// 전역 상수
// ==============================
// 백엔드 API 기본 주소입니다.
const API_BASE_URL = 'http://localhost:8080/api';

// ==============================
// DOM 요소 캐싱
// ==============================
// 부서 생성/수정 폼 전체 요소입니다.
// <form id="dept-form"> 요소를 참조합니다.
const deptForm = document.getElementById('dept-form');

// 수정 모드에서 사용할 숨김 ID input입니다.
// <input type="hidden" id="dept-id"> 요소를 참조합니다.
const deptIdInput = document.getElementById('dept-id');

// 부서명 입력 input입니다.
// <input type="text" id="dept-name"> 요소를 참조합니다.
const deptNameInput = document.getElementById('dept-name');

// 부서 설명 입력 input입니다.
// <input type="text" id="dept-desc"> 요소를 참조합니다.
const deptDescInput = document.getElementById('dept-desc');

// 폼 카드 제목 요소입니다.
// <h5 id="dept-form-title"> 요소를 참조합니다.
const deptFormTitle = document.getElementById('dept-form-title');

// 생성/수정 제출 버튼 요소입니다.
// <button id="dept-submit-btn"> 요소를 참조합니다.
const deptSubmitBtn = document.getElementById('dept-submit-btn');

// 수정 취소 버튼 요소입니다.
// <button id="dept-cancel-btn"> 요소를 참조합니다.
const deptCancelBtn = document.getElementById('dept-cancel-btn');


// 단건 조회용 ID 입력 input입니다.
// <input type="number" id="search-dept-id"> 요소를 참조합니다.
const searchDeptIdInput = document.getElementById('search-dept-id');

// 단건 조회 실행 버튼 요소입니다.
// card:nth-child: 첫 번째 카드가 폼, 두 번째 카드가 단건 조회이므로 nth-child(2)로 참조합니다.
// <button class="btn btn-success"> 요소 중 단건 조회 버튼을 참조합니다.
const searchDeptBtn = document.querySelector('#dept-section .card:nth-child(2) .btn-success');

// 단건 조회 결과 출력 영역입니다.
// <div id="dept-detail-result"> 요소를 참조합니다.
const deptDetailResult = document.getElementById('dept-detail-result');

// 부서 목록 tbody 요소입니다.
// <tbody id="dept-list"> 요소를 참조합니다.
const deptListBody = document.getElementById('dept-list');

// 로딩 표시 요소입니다.
// <div id="dept-loading"> 요소를 참조합니다.
const deptLoading = document.getElementById('dept-loading');

// 목록 새로고침 버튼 요소입니다.
// <button class="btn btn-info"> 요소 중 새로고침 버튼을 참조합니다.
const refreshBtn = document.querySelector('#dept-section .list-header .btn-info');

// 성공 알림 박스 요소입니다.
// <div id="alert-success"> 요소를 참조합니다.
const alertSuccess = document.getElementById('alert-success');

// 오류 알림 박스 요소입니다.
// <div id="alert-error"> 요소를 참조합니다.
const alertError = document.getElementById('alert-error');

// ==============================
// API 통신 함수 (Data Layer)
// ==============================

/**
 * 모든 부서 목록을 서버에서 가져옵니다.
 */
async function fetchAllDepartments() {
    // 요청 시작 시 로딩을 켭니다.
    showLoading(true);
    try {
        // 전체 부서 조회 API를 호출합니다.
        const response = await fetch(`${API_BASE_URL}/departments`);
        // 실패 상태 코드면 에러를 발생시킵니다.
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // response.status: 동적
        // 성공하면 JSON 데이터를 반환합니다.
        return await response.json();
    } catch (error) {
        // 콘솔에 상세 오류를 출력합니다.
        console.error('Error fetching departments:', error);
        // 사용자에게 오류 메시지를 노출합니다.
        handleApiError(error);
        // 호출부 안전 처리를 위해 빈 배열을 반환합니다.
        return [];
    } finally {
        // 요청 종료 시 로딩을 끕니다.
        showLoading(false);
    }
}

/**
 * ID로 특정 부서 정보를 가져옵니다.
 * @param {number} id - 조회할 부서 ID
 */
async function fetchDepartmentById(id) {
    // 요청 시작 시 로딩을 켭니다.
    showLoading(true);
    try {
        // 특정 ID 부서 조회 API를 호출합니다.
        const response = await fetch(`${API_BASE_URL}/departments/${id}`);
        // 404면 친화적인 메시지를 보여주고 null 반환합니다.
        if (response.status === 404) {
            showMessage('해당 ID의 부서가 존재하지 않습니다.', true);
            return null;
        }
        // 기타 실패 상태 코드도 에러 처리합니다.
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // 성공하면 JSON 데이터를 반환합니다.
        return await response.json();
    } catch (error) {
        // 콘솔에 상세 오류를 출력합니다.
        console.error(`Error fetching department ${id}:`, error);
        // 사용자에게 오류 메시지를 노출합니다.
        handleApiError(error);
        // 실패 시 null 반환합니다.
        return null;
    } finally {
        // 요청 종료 시 로딩을 끕니다.
        showLoading(false);
    }
}

/**
 * 새 부서를 생성합니다.
 * @param {object} departmentData - { departmentName, departmentDescription }
 */
async function createDepartment(departmentData) {
    try {
        // POST 요청으로 부서를 생성합니다. 
        // 서버로 보내는 작업 -> json 형태로 보내야 하므로 body에 JSON.stringify(departmentData)로 변환하여 전송
        const response = await fetch(`${API_BASE_URL}/departments`, {
            // HTTP 메서드는 POST입니다.
            method: 'POST',
            // JSON 전송 헤더를 설정합니다.
            headers: { 'Content-Type': 'application/json' },
            // 입력 데이터를 JSON 문자열로 전송합니다.
            body: JSON.stringify(departmentData),
        });

        // 실패 응답이면 서버 오류 메시지를 파싱합니다.
        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 성공 알림을 표시합니다.
        showMessage('부서가 성공적으로 생성되었습니다.');
        // 폼을 초기화합니다.
        resetForm();
        // 목록을 다시 불러옵니다.
        loadAndRenderDepartments();
    } catch (error) {
        // 콘솔에 상세 오류를 출력합니다.
        console.error('Error creating department:', error);
        // 사용자에게 오류 메시지를 표시합니다.
        handleApiError(error);
    }
}

/**
 * 기존 부서 정보를 수정합니다.
 * @param {number} id - 수정할 부서 ID
 * @param {object} departmentData - { departmentName, departmentDescription }
 */
async function updateDepartment(id, departmentData) {
    try {
        // PUT 요청으로 부서 정보를 수정합니다.
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            // HTTP 메서드는 PUT입니다.
            method: 'PUT',
            // JSON 전송 헤더를 설정합니다.
            headers: { 'Content-Type': 'application/json' },
            // 수정 데이터를 JSON 문자열로 전송합니다.
            body: JSON.stringify(departmentData),
        });

        // 실패 응답이면 서버 오류 메시지를 파싱합니다.
        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 성공 알림을 표시합니다.
        showMessage('부서 정보가 성공적으로 수정되었습니다.');
        // 폼을 등록 모드로 초기화합니다.
        resetForm();
        // 목록을 다시 불러옵니다.
        loadAndRenderDepartments();
    } catch (error) {
        // 콘솔에 상세 오류를 출력합니다.
        console.error(`Error updating department ${id}:`, error);
        // 사용자에게 오류 메시지를 표시합니다.
        handleApiError(error);
    }
}

/**
 * 부서를 삭제합니다.
 * @param {number} id - 삭제할 부서 ID
 */
async function deleteDepartment(id) {
    try {
        // DELETE 요청으로 부서를 삭제합니다.
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            // HTTP 메서드는 DELETE입니다.
            method: 'DELETE',
        });

        // 실패 상태 코드면 에러 처리합니다.
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // 성공 알림을 표시합니다.
        showMessage('부서가 삭제되었습니다.');
        // 목록을 다시 불러옵니다.
        loadAndRenderDepartments();
    } catch (error) {
        // 콘솔에 상세 오류를 출력합니다.
        console.error(`Error deleting department ${id}:`, error);
        // 사용자에게 오류 메시지를 표시합니다.
        handleApiError(error);
    }
}

// ==============================
// 렌더링 및 UI 조작 함수 (Presentation Layer)
// ==============================

/**
 * 부서 목록을 테이블에 렌더링합니다.
 * @param {Array<object>} departments - 부서 데이터 배열
 */
function renderDepartmentList(departments) {
    // 기존 목록 내용을 비웁니다.
    deptListBody.innerHTML = '';

    // 데이터가 없으면 안내 행을 출력합니다.
    if (!departments || departments.length === 0) {
        deptListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">부서정보가 없습니다.</td></tr>';
        return;
    }

    // 각 부서 데이터를 행 단위로 렌더링합니다.
    departments.forEach(dept => {
        // 행 요소를 생성합니다.
        const row = document.createElement('tr');

        // 행 내부 HTML을 구성합니다.
        row.innerHTML = `
            <td>${dept.id}</td>
            <td>${escapeHTML(dept.departmentName)}</td>
            <td>${escapeHTML(dept.departmentDescription)}</td>
            <td class="actions">
                <button class="btn btn-warning btn-sm" data-id="${dept.id}" data-action="edit">수정</button>
                <button class="btn btn-danger btn-sm" data-id="${dept.id}" data-action="delete">삭제</button>
            </td>
        `;

        // 수정 버튼 dataset에 원본 부서 데이터를 문자열로 저장합니다. 
        // 이렇게 하면 클릭 시 해당 데이터를 쉽게 복원하여 수정 폼에 채울 수 있습니다.
        // JSON.stringify : 객체를 JSON 문자열로 변환하는 메서드입니다.
        row.querySelector('[data-action="edit"]').dataset.department = JSON.stringify(dept);
        // 생성한 행을 tbody에 추가합니다.
        // <tr> 엘리먼트를 <tbody>에 추가
        // deptListBody.appendChild(row) : deptListBody 요소의 자식으로 row 요소를 추가합니다.
        //  이렇게 하면 동적으로 생성된 행이 테이블에 표시됩니다.
        deptListBody.appendChild(row);
    });
}

/**
 * 단건 조회 결과를 화면에 표시합니다.
 * @param {object} department - 부서 데이터
 */
function renderDepartmentDetail(department) {
    // 데이터가 없으면 상세 영역을 숨깁니다.
    if (!department) {
        deptDetailResult.style.display = 'none';
        return;
    }

    // 상세 정보를 안전하게 HTML로 렌더링합니다.
    deptDetailResult.innerHTML = `
        <p><strong>ID:</strong> ${department.id}</p>
        <p><strong>부서명:</strong> ${escapeHTML(department.departmentName)}</p>
        <p><strong>부서 설명:</strong> ${escapeHTML(department.departmentDescription)}</p>
    `;

    // 상세 영역을 표시합니다.
    deptDetailResult.style.display = 'block';
}

/**
 * 로딩 인디케이터를 표시하거나 숨깁니다.
 * @param {boolean} isLoading - 로딩 상태
 */
function showLoading(isLoading) {
    // 로딩 상태에 따라 display를 토글합니다.
    // isLoading이 true면 'block'으로 보여주고, false면 'none'으로 숨깁니다.
    deptLoading.style.display = isLoading ? 'block' : 'none';
}

/**
 * 성공 또는 오류 메시지를 잠시 보여줍니다.
 * @param {string} message - 표시할 메시지
 * @param {boolean} isError - 오류 메시지 여부
 */
function showMessage(message, isError = false) {
    // 오류 여부에 따라 사용할 알림 박스를 고릅니다.
    const alertBox = isError ? alertError : alertSuccess;
    // 알림 메시지 텍스트를 설정합니다.
    alertBox.textContent = message;
    // 알림을 표시합니다.
    alertBox.classList.add('show');

    // 3초 뒤 알림을 자동으로 숨깁니다.
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 3000);
}

/**
 * XSS 공격 방지를 위해 HTML 태그를 이스케이프 처리합니다.
 * @param {string} str - 원본 문자열
 */
function escapeHTML(str) {
    // 특수 문자를 HTML 엔티티로 치환해 안전하게 반환합니다.
    return str.replace(/[&<>"']/g, (match) => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[match];
    });
}

/**
 * 부서 생성/수정 폼을 초기 상태로 리셋합니다.
 */
function resetForm() {
    // 입력 폼 값을 초기화합니다.
    deptForm.reset();
    // 숨김 ID를 비웁니다.
    deptIdInput.value = '';
    // 제목을 등록 모드로 변경합니다.
    deptFormTitle.textContent = '부서 등록';
    // 제출 버튼 텍스트를 생성 모드로 변경합니다.
    deptSubmitBtn.textContent = '부서 생성';
    // 취소 버튼을 숨깁니다.
    deptCancelBtn.style.display = 'none';
}

/**
 * 수정 모드로 폼을 설정합니다.
 * @param {object} department - 수정할 부서 데이터
 */
function setupEditForm(department) {
    // 수정 대상 ID를 숨김 필드에 채웁니다.
    deptIdInput.value = department.id;
    // 부서명을 입력칸에 채웁니다.
    deptNameInput.value = department.departmentName;
    // 부서 설명을 입력칸에 채웁니다.
    deptDescInput.value = department.departmentDescription;
    // 제목을 수정 모드로 변경합니다.
    deptFormTitle.textContent = '부서 수정';
    // 제출 버튼 텍스트를 수정 저장으로 변경합니다.
    deptSubmitBtn.textContent = '수정 저장';
    // 취소 버튼을 표시합니다.
    deptCancelBtn.style.display = 'inline-block';
    // 사용자가 폼을 바로 볼 수 있게 상단으로 이동합니다.
    window.scrollTo(0, 0);
}

/**
 * API 에러를 사용자 메시지로 변환하여 표시합니다.
 * @param {Error} error - 발생한 에러 객체
 */
function handleApiError(error) {
    // 네트워크 연결 실패 케이스를 별도 처리합니다.
    if (error.message.includes('Failed to fetch')) {
        showMessage('서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인하세요.', true);
    } else {
        // 그 외는 에러 메시지를 그대로 보여줍니다.
        showMessage(error.message, true);
    }
}

// ==============================
// 이벤트 핸들러 (Control Layer)
// ==============================

/**
 * 페이지 로드 시 부서 목록을 가져와 렌더링합니다.
 */
async function loadAndRenderDepartments() {
    // API로부터 목록 데이터를 가져옵니다.
    const departments = await fetchAllDepartments();
    // 가져온 데이터를 테이블에 렌더링합니다.
    // 서버에 가져온 Json 데이터를 <tbody> 아래에 <tr> 엘리먼트를 동적으로 렌더링
    renderDepartmentList(departments);
}

/**
 * 부서 생성/수정 폼 제출 이벤트를 처리합니다.
 * @param {Event} e - 폼 제출 이벤트
 */
async function handleFormSubmit(e) {
    // 기본 제출 동작(새로고침)을 막습니다.
    // submit 이벤트가 처리되지 않도록 기본 동작을 막는 메서드
    e.preventDefault();

    // 숨김 ID 값을 읽어 등록/수정 모드를 구분합니다.
    const id = deptIdInput.value;

    // 입력값을 trim 처리해 전송 객체를 만듭니다.
    const departmentData = {
        departmentName: deptNameInput.value.trim(), // trim() : 문자열 양쪽 공백 제거, object로 만들어서 departmentData에 저장
        departmentDescription: deptDescInput.value.trim(),
    };

    // 필수값 유효성을 검사합니다.
    if (!departmentData.departmentName || !departmentData.departmentDescription) {
        showMessage('부서명과 부서 설명을 모두 입력해주세요.', true);
        return;
    }

    // ID가 있으면 수정 모드입니다.
    if (id) {
        await updateDepartment(id, departmentData);
    } else {
        // ID가 없으면 생성 모드입니다.
        await createDepartment(departmentData);
    }
}

/**
 * ID로 부서 조회 버튼 클릭 이벤트를 처리합니다.
 */
async function handleSearchById() {
    // 조회 input에서 ID를 읽습니다.
    const id = searchDeptIdInput.value;

    // ID 미입력 시 안내 후 종료합니다.
    if (!id) {
        showMessage('조회할 부서 ID를 입력해주세요.', true);
        return;
    }

    // 단건 조회를 실행합니다.
    // id로 fetch() 함수 ajax 통신
    const department = await fetchDepartmentById(id);
    // 조회 결과를 화면에 렌더링합니다. -> json 데이터 렌더링
    renderDepartmentDetail(department);
}

/**
 * 부서 목록의 버튼(수정/삭제) 클릭 이벤트를 처리합니다.
 * @param {Event} e - 클릭 이벤트
 */
function handleListClick(e) {
    // e.target : 수정 또는 삭제 버튼
    // 이벤트가 발생한 실제 요소를 가져옵니다.
    const target = e.target;
    // 버튼의 data-action 값을 읽습니다.
    // dataset은 HTML 요소의 data-* 속성에 접근할 수 있는 객체입니다. 예를 들어, data-action="edit"이면 target.dataset.action은 "edit"이 됩니다.
    const action = target.dataset.action;
    // 버튼의 data-id 값을 읽습니다.
    const id = target.dataset.id;

    // 버튼 클릭이 아니면 무시합니다.
    if (!action || !id) return;

    // 수정 버튼 클릭 처리입니다.
    if (action === 'edit') {
        // dataset에 저장된 원본 데이터를 객체로 복원합니다.
        const department = JSON.parse(target.dataset.department);
        // 수정 폼으로 전환합니다.
        setupEditForm(department);
    } else if (action === 'delete') {
        // 삭제 버튼 클릭 처리입니다.
        if (confirm(`정말로 ID ${id} 부서를 삭제하시겠습니까?`)) {
            // 사용자 확인 시 삭제 API를 호출합니다.
            deleteDepartment(id);
        }
    }
}

// ==============================
// 이벤트 리스너 연결
// ==============================
// DOMContentLoaded라는 이벤트 처리 
// DOM : HTML 문서를 “자바스크립트가 다룰 수 있게 객체 형태로 바꾼 것”
// DOM이 완전히 준비되면 초기화 로직을 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
    // 진입 시 목록을 즉시 로드합니다.
    loadAndRenderDepartments();

    // 폼 제출 이벤트를 연결합니다.
    deptForm.addEventListener('submit', handleFormSubmit);
    // 단건 조회 버튼 클릭 이벤트를 연결합니다.
    searchDeptBtn.addEventListener('click', handleSearchById);
    // 목록의 수정/삭제 클릭 이벤트를 위임 방식으로 연결합니다.
    deptListBody.addEventListener('click', handleListClick);
    // 취소 버튼 클릭 이벤트를 연결합니다.
    deptCancelBtn.addEventListener('click', resetForm);
    // 새로고침 버튼 클릭 이벤트를 연결합니다.
    refreshBtn.addEventListener('click', loadAndRenderDepartments);
});