// =================
// 직원 관리 전역 변수 및 상수
// =================
// API_BASE_URL은 department.js에 이미 선언되어 있다고 가정합니다.
// 만약 파일을 분리하여 단독으로 사용할 경우 아래 주석을 해제하세요.
// const API_BASE_URL = 'http://localhost:8080/api';


// =================
// 직원 관리 DOM 요소 캐싱
// =================
const empForm = document.getElementById('emp-form');
// 숨겨진 필드: 수정 모드일 때 직원 ID를 보관
const empIdInput = document.getElementById('emp-id');
// 이름 입력 필드
const empFirstNameInput = document.getElementById('emp-firstname');
// 성 입력 필드
const empLastNameInput = document.getElementById('emp-lastname');
// 이메일 입력 필드
const empEmailInput = document.getElementById('emp-email');
// 부서 선택 드롭다운(select)
const empDeptIdInput = document.getElementById('emp-dept-id');
// 폼 타이틀(등록/수정 텍스트 변경)
const empFormTitle = document.getElementById('emp-form-title');
// 폼 제출 버튼(생성/수정 저장)
const empSubmitBtn = document.getElementById('emp-submit-btn');
// 수정 취소 버튼
const empCancelBtn = document.getElementById('emp-cancel-btn');

// ID 단건 조회 입력/버튼
const searchEmpIdInput = document.getElementById('search-emp-id');
const searchEmpIdBtn = document.querySelector('#emp-section .card:nth-child(2) .form-inline:nth-child(2) .btn-success');
// 이메일 단건 조회 입력/버튼
const searchEmpEmailInput = document.getElementById('search-emp-email');
const searchEmpEmailBtn = document.querySelector('#emp-section .card:nth-child(2) .form-inline:nth-child(3) .btn-success');
// 단건 조회 결과 출력 영역
const empDetailResult = document.getElementById('emp-detail-result');

// 직원 목록 tbody / 로딩 표시 / 액션 버튼들
const empListBody = document.getElementById('emp-list');
const empLoading = document.getElementById('emp-loading');
const empRefreshBtn = document.querySelector('#emp-section .list-header .btn-info');
const empWithDeptBtn = document.querySelector('#emp-section .list-header .btn-secondary');

// =============================
// 직원 API 통신 함수 (Data Layer)
// =============================

/**
 * 모든 직원 목록을 서버에서 가져옵니다. (기본)
 */
async function fetchAllEmployees() {
    // 목록 조회 시작 전 로딩 UI 표시
    showEmpLoading(true);
    try {
        // 기본 직원 목록 API 호출
        const response = await fetch(`${API_BASE_URL}/employees`);
        // HTTP 오류 상태는 예외 처리
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // JSON 배열 반환
        return await response.json();
    } catch (error) {
        // 개발자 콘솔 로그
        console.error('Error fetching employees:', error);
        handleApiError(error); // department.js의 공통 에러 핸들러 사용
        // 실패 시 빈 배열 반환하여 렌더링 오류 방지
        return [];
    } finally {
        // 성공/실패와 무관하게 로딩 UI 숨김
        showEmpLoading(false);
    }
}

/**
 * 모든 직원 목록을 부서 정보와 함께 서버에서 가져옵니다.
 */
async function fetchAllEmployeesWithDepartments() {
    // 목록 조회 시작 전 로딩 UI 표시
    showEmpLoading(true);
    try {
        // 직원 + 부서 조인 정보 API 호출
        const response = await fetch(`${API_BASE_URL}/employees/departments`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching employees with departments:', error);
        handleApiError(error);
        return [];
    } finally {
        showEmpLoading(false);
    }
}

/**
 * ID로 특정 직원 정보를 가져옵니다.
 * @param {number} id - 조회할 직원 ID
 */
async function fetchEmployeeById(id) {
    // 단건 조회 시 로딩 표시
    showEmpLoading(true);
    try {
        // 경로 파라미터로 ID 전달
        const response = await fetch(`${API_BASE_URL}/employees/${id}`);
        // 404는 사용자 친화 메시지로 처리
        if (response.status === 404) {
            showMessage('해당 ID의 직원이 존재하지 않습니다.', true);
            return null;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching employee ${id}:`, error);
        handleApiError(error);
        return null;
    } finally {
        showEmpLoading(false);
    }
}

/**
 * 이메일로 특정 직원 정보를 가져옵니다.
 * @param {string} email - 조회할 직원 이메일
 */
async function fetchEmployeeByEmail(email) {
    // 단건 조회 시 로딩 표시
    showEmpLoading(true);
    try {
        // 이메일 기반 조회 API 호출
        const response = await fetch(`${API_BASE_URL}/employees/email/${email}`);
        // 조회 결과 없음
        if (response.status === 404) {
            showMessage('해당 이메일의 직원이 존재하지 않습니다.', true);
            return null;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching employee with email ${email}:`, error);
        handleApiError(error);
        return null;
    } finally {
        showEmpLoading(false);
    }
}

/**
 * 새 직원을 생성합니다.
 * @param {object} employeeData - { firstName, lastName, email, departmentId }
 */
async function createEmployee(employeeData) {
    try {
        // 직원 생성 요청(POST)
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // JS 객체를 JSON 문자열로 직렬화
            body: JSON.stringify(employeeData),
        });
        if (!response.ok) {
            // 서버 에러 메시지가 있으면 우선 사용
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // 성공 처리: 알림 + 폼 초기화 + 목록 갱신
        showMessage('직원이 성공적으로 생성되었습니다.');
        resetEmpForm();
        loadAndRenderEmployees(); // 목록 자동 갱신
    } catch (error) {
        console.error('Error creating employee:', error);
        handleApiError(error);
    }
}

/**
 * 기존 직원 정보를 수정합니다.
 * @param {number} id - 수정할 직원 ID
 * @param {object} employeeData - { firstName, lastName, email, departmentId }
 */
async function updateEmployee(id, employeeData) {
    try {
        // 직원 수정 요청(PUT)
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        showMessage('직원 정보가 성공적으로 수정되었습니다.');
        resetEmpForm();
        loadAndRenderEmployees(); // 목록 자동 갱신
    } catch (error) {
        console.error(`Error updating employee ${id}:`, error);
        handleApiError(error);
    }
}

/**
 * 직원을 삭제합니다.
 * @param {number} id - 삭제할 직원 ID
 */
async function deleteEmployee(id) {
    try {
        // 직원 삭제 요청(DELETE)
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        showMessage('직원이 삭제되었습니다.');
        loadAndRenderEmployees(); // 목록 자동 갱신
    } catch (error) {
        console.error(`Error deleting employee ${id}:`, error);
        handleApiError(error);
    }
}


// ====================================
// 렌더링 및 UI 조작 함수 (Presentation Layer)
// ====================================

/**
 * 직원 목록을 테이블에 렌더링합니다.
 * @param {Array<object>} employees - 직원 데이터 배열
 * @param {boolean} withDept - 부서 정보 포함 여부
 */
function renderEmployeeList(employees, withDept = false) {
    // 기존 목록 비우기
    empListBody.innerHTML = '';
    // 데이터가 없을 때 안내 행 렌더링
    if (!employees || employees.length === 0) {
        empListBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">표시할 직원이 없습니다.</td></tr>`;
        return;
    }

    // 헤더 변경
    const tableHeader = empListBody.parentElement.querySelector('thead');
    if (withDept) {
        // 직원 + 부서명 컬럼 헤더
        tableHeader.innerHTML = `
            <tr>
                <th>ID</th>
                <th>이름</th>
                <th>성</th>
                <th>이메일</th>
                <th>부서명</th>
                <th>작업</th>
            </tr>
        `;
    } else {
        // 기본 직원 목록(부서 ID) 컬럼 헤더
        tableHeader.innerHTML = `
            <tr>
                <th>ID</th>
                <th>이름</th>
                <th>성</th>
                <th>이메일</th>
                <th>부서 ID</th>
                <th>작업</th>
            </tr>
        `;
    }
    
    employees.forEach(emp => {
        // 직원 한 건당 테이블 행 생성
        const row = document.createElement('tr');
        // 모드에 따라 부서명 또는 부서ID 표시
        const departmentInfo = withDept 
            ? escapeHTML(emp.departmentDto?.departmentName || 'N/A')
            : emp.departmentId;

        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${escapeHTML(emp.firstName)}</td>
            <td>${escapeHTML(emp.lastName)}</td>
            <td>${escapeHTML(emp.email)}</td>
            <td>${departmentInfo}</td>
            <td class="actions">
                <button class="btn btn-warning btn-sm" data-id="${emp.id}" data-action="edit">수정</button>
                <button class="btn btn-danger btn-sm" data-id="${emp.id}" data-action="delete">삭제</button>
            </td>
        `;
        // 수정 버튼에서 즉시 사용하도록 직원 객체를 data 속성에 저장
        row.querySelector('[data-action="edit"]').dataset.employee = JSON.stringify(emp);
        // tbody에 행 추가
        empListBody.appendChild(row);
    });
}

/**
 * 단건 조회 결과를 화면에 표시합니다.
 * @param {object} employee - 직원 데이터
 */
function renderEmployeeDetail(employee) {
    // 조회 결과가 없으면 상세 영역 숨김
    if (!employee) {
        empDetailResult.style.display = 'none';
        return;
    }
    // 조회된 직원 정보 렌더링
    empDetailResult.innerHTML = `
        <p><strong>ID:</strong> ${employee.id}</p>
        <p><strong>이름:</strong> ${escapeHTML(employee.firstName)} ${escapeHTML(employee.lastName)}</p>
        <p><strong>이메일:</strong> ${escapeHTML(employee.email)}</p>
        <p><strong>부서 ID:</strong> ${employee.departmentId}</p>
    `;
    empDetailResult.style.display = 'block';
}


/**
 * 직원 목록 로딩 인디케이터를 표시하거나 숨깁니다.
 * @param {boolean} isLoading - 로딩 상태
 */
function showEmpLoading(isLoading) {
    // true면 block, false면 none
    empLoading.style.display = isLoading ? 'block' : 'none';
}


/**
 * 직원 생성/수정 폼을 초기 상태로 리셋합니다.
 */
function resetEmpForm() {
    // 입력값 초기화
    empForm.reset();
    // 숨겨진 ID 제거 -> 생성 모드로 전환
    empIdInput.value = '';
    // UI 문구 원복
    empFormTitle.textContent = '직원 등록';
    empSubmitBtn.textContent = '직원 생성';
    // 취소 버튼 숨김
    empCancelBtn.style.display = 'none';
}

/**
 * 수정 모드로 폼을 설정합니다.
 * @param {object} employee - 수정할 직원 데이터
 */
function setupEmpEditForm(employee) {
    // 수정 대상 데이터로 폼 채우기
    empIdInput.value = employee.id;
    empFirstNameInput.value = employee.firstName;
    empLastNameInput.value = employee.lastName;
    empEmailInput.value = employee.email;
    empDeptIdInput.value = employee.departmentId;
    // 수정 모드 UI 적용
    empFormTitle.textContent = '직원 수정';
    empSubmitBtn.textContent = '수정 저장';
    empCancelBtn.style.display = 'inline-block';
    // 사용자가 폼을 바로 볼 수 있게 스크롤 이동
    empForm.scrollIntoView({ behavior: 'smooth' });
}


// ========================
// 이벤트 핸들러 (Control Layer)
// ========================

/**
 * 페이지 로드 나 새로고침 버튼 클릭 시 직원 목록을 가져와 렌더링합니다.
 */
async function loadAndRenderEmployees() {
    // API에서 기본 목록 조회
    const employees = await fetchAllEmployees();
    // 테이블 렌더링(부서 ID 모드)
    renderEmployeeList(employees, false);
}

/**
 * '직원+부서 조회' 버튼 클릭 시, 부서 정보가 포함된 목록을 가져와 렌더링합니다.
 */
async function loadAndRenderEmployeesWithDept() {
    // API에서 직원+부서 목록 조회
    const employees = await fetchAllEmployeesWithDepartments();
    // 테이블 렌더링(부서명 모드)
    renderEmployeeList(employees, true);
}


/**
 * 직원 생성/수정 폼 제출 이벤트를 처리합니다.
 * @param {Event} e - 폼 제출 이벤트
 */
async function handleEmpFormSubmit(e) {
    // 기본 폼 제출(페이지 리로드) 방지
    e.preventDefault();
    // 값이 있으면 수정 모드, 없으면 생성 모드
    const id = empIdInput.value;
    // 폼 입력값 정리
    const employeeData = {
        firstName: empFirstNameInput.value.trim(),
        lastName: empLastNameInput.value.trim(),
        email: empEmailInput.value.trim(),
        departmentId: empDeptIdInput.value,
    };

    // 필수 입력값 검증
    if (!employeeData.firstName || !employeeData.lastName || !employeeData.email || !employeeData.departmentId) {
        showMessage('모든 필드를 입력해주세요.', true);
        return;
    }
    // 부서 ID 유효성 검증
    if (employeeData.departmentId <= 0) {
        showMessage('유효한 부서 ID를 입력해주세요.', true);
        return;
    }

    // 모드에 따라 생성/수정 API 호출
    if (id) {
        await updateEmployee(id, employeeData);
    } else {
        await createEmployee(employeeData);
    }
}

/**
 * ID로 직원 조회 버튼 클릭 이벤트를 처리합니다.
 */
async function handleSearchEmpById() {
    // 검색 입력값 읽기
    const id = searchEmpIdInput.value;
    // 빈 값 방어
    if (!id) {
        showMessage('조회할 직원 ID를 입력해주세요.', true);
        return;
    }
    // 조회 후 상세영역에 렌더링
    const employee = await fetchEmployeeById(id);
    renderEmployeeDetail(employee);
}

/**
 * 이메일로 직원 조회 버튼 클릭 이벤트를 처리합니다.
 */
async function handleSearchEmpByEmail() {
    // 검색 입력값 읽기
    const email = searchEmpEmailInput.value;
    // 빈 값 방어
    if (!email) {
        showMessage('조회할 직원 이메일을 입력해주세요.', true);
        return;
    }
    // 조회 후 상세영역에 렌더링
    const employee = await fetchEmployeeByEmail(email);
    renderEmployeeDetail(employee);
}

/**
 * 직원 목록의 버튼(수정/삭제) 클릭 이벤트를 처리합니다.
 * @param {Event} e - 클릭 이벤트
 */
function handleEmpListClick(e) {
    // 이벤트 위임: 클릭된 요소에서 data-* 읽기
    const target = e.target;
    const action = target.dataset.action;
    const id = target.dataset.id;

    // 버튼이 아닌 곳 클릭 시 무시
    if (!action || !id) return;

    if (action === 'edit') {
        // data 속성에 저장해둔 직원 JSON 복원 (객체로 바꾼다)
        const employee = JSON.parse(target.dataset.employee);
        setupEmpEditForm(employee);
    } else if (action === 'delete') {
        // 사용자 확인 후 삭제 실행
        if (confirm(`정말로 ID ${id} 직원을 삭제하시겠습니까?`)) {
            deleteEmployee(id);
        }
    }
}

/**
 * 직원 관리 탭 기능 초기화 함수
 */
async function initEmployeeTab() {
    // 이벤트 리스너가 중복 등록되는 것을 방지하기 위해 한번만 실행되도록 플래그 사용
    if (initEmployeeTab.initialized) return; // initialized 속성이 true면 이미 초기화된 상태이므로 함수 종료

    await populateDepartmentDropdown(); // 부서 드롭다운 채우기
    loadAndRenderEmployees(); // 초기 데이터 로드

    // 폼/버튼/목록 이벤트 연결
    empForm.addEventListener('submit', handleEmpFormSubmit);
    empCancelBtn.addEventListener('click', resetEmpForm);
    
    searchEmpIdBtn.addEventListener('click', handleSearchEmpById);
    searchEmpEmailBtn.addEventListener('click', handleSearchEmpByEmail);
    
    empListBody.addEventListener('click', handleEmpListClick);
    empRefreshBtn.addEventListener('click', loadAndRenderEmployees);
    empWithDeptBtn.addEventListener('click', loadAndRenderEmployeesWithDept);
    
    // 초기화 완료 플래그 설정
    initEmployeeTab.initialized = true;
    console.log("Employee tab initialized.");
}

/**
 * 부서 목록을 가져와 직원 폼의 드롭다운을 채웁니다.
 */
async function populateDepartmentDropdown() {
    // fetchAllDepartments 함수는 department.js에 이미 존재하므로,
    // 여기서는 간단하게 fetch를 직접 사용하여 부서 목록만 가져옵니다.
    try {
        // 부서 목록 조회
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) throw new Error('부서 목록을 불러오는 데 실패했습니다.');
        
        // 응답 JSON 파싱
        const departments = await response.json();
        
        empDeptIdInput.innerHTML = '<option value="">부서를 선택하세요...</option>'; // 기존 옵션 초기화
        
        // 부서 데이터를 드롭다운 옵션으로 추가
        departments.forEach(dept => {
            // 부서 ID와 이름을 옵션으로 표시 (예: "개발팀 (ID: 1)")
            const option = document.createElement('option'); // <option value="dept.id">dept.departmentName (ID: dept.id)</option>
            // 선택 값(value)은 서버로 전송할 부서 ID
            option.value = dept.id; 
            // 사용자에게 보여줄 텍스트
            option.textContent = `${dept.departmentName} (ID: ${dept.id})`;
            empDeptIdInput.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating department dropdown:', error);
        handleApiError(error);
    }
}