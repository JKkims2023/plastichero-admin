'use client';

import React from "react";
// Import 추가
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { 
    DataGrid,
    GridToolbar, 
    GridRowsProp, 
    GridColDef, 
    GridToolbarContainer, 
    GridToolbarExport, 
    GridToolbarColumnsButton, 
    GridToolbarFilterButton,
    gridClasses,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridPagination,
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import SortIcon from '@mui/icons-material/Sort';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { GridEventListener } from '@mui/x-data-grid';
import UserInfoView from '../../../components/UserInfoView';
import PointHistoryView from '../../../components/PointHistoryView';
import WalletInfoView from '../../../components/WalletInfoView';
import { get } from "http";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import CommentIcon from '@mui/icons-material/Comment';
import { getFileUrl, isS3File } from '../../../lib/fileHelper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type Anchor = 'bottom';

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({

    [`& .${gridClasses.row}.even`]: {
      backgroundColor: theme.palette.grey[50],
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
      '&.Mui-selected': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity,
        ),
        '&:hover': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY +
              theme.palette.action.selectedOpacity +
              theme.palette.action.hoverOpacity,
          ),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: alpha(
              theme.palette.primary.main,
              ODD_OPACITY + theme.palette.action.selectedOpacity,
            ),
          },
        },
      },
    },
}));

// VisuallyHiddenInput 컴포넌트 추가
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// 타입 인터페이스 수정
interface ImageFile {
    file: File | null;
    preview: string;
}

// selectedContent 타입 정의 수정
interface NoticeContent {
    contentID: string;
    contentTitle: string;
    commentEnabled: boolean;
    notice_no?: string;
    notice_title?: string;
    notice_desctription?: string;
    notice_picture?: string;
    notice_picture2?: string;
    notice_picture3?: string;
    notice_picture4?: string;
    notice_picture5?: string; // PDF 파일 URL로 사용
    notice_movie?: string;
    comment_flag?: string;
    [key: string]: any; // 추가 속성을 위한 인덱스 시그니처
}

export default function Home() {

    const ref_Div = React.useRef<HTMLDivElement>(null);
    const ref_Grid = React.useRef(0);

    const [pagingIdx, setPaginIdx] = React.useState('0');
    const [filterInfo, setFilterInfo] = React.useState('');
    const [noticeList, setNoticeList] = React.useState([]);
    const [filterNoticeList, setFilterNoticeList] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState<NoticeContent>({
        contentID: '',
        contentTitle: '',
        commentEnabled: false
    });

    const [filterContentTypeMethod, setFilterContentTypeMethod] = React.useState(10);
    const [filterContentTypeValueMethod, setFilterContentTypeValueMethod] = React.useState('all');
    const [filterStatusMethod, setFilterStatusMethod] = React.useState(10);
    const [filterStatusValueMethod, setFilterStatusValueMethod] = React.useState('all');
    const [stateBottom, setStateBottom] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [registerDialogOpen, setRegisterDialogOpen] = React.useState(false);
    const [registerFormValid, setRegisterFormValid] = React.useState({
        title: false,
        description: false
    });

    const [imageFiles, setImageFiles] = React.useState<ImageFile[]>([
        { file: null, preview: '' },
        { file: null, preview: '' },
        { file: null, preview: '' },
        { file: null, preview: '' },
        { file: null, preview: '' }
    ]);
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [videoPreview, setVideoPreview] = React.useState<string>('');
    const [pdfFile, setPdfFile] = React.useState<File | null>(null);
    const [pdfPreview, setPdfPreview] = React.useState<string>('');

    // 미디어 섹션 접기/펼치기 상태 관리
    const [mediaExpanded, setMediaExpanded] = React.useState({
        images: true,
        video: true,
        pdf: true
    });

    // 탭 상태 관리
    const [activeTab, setActiveTab] = React.useState(0);

    // PDF 뷰어 상태 관리 추가
    const [pdfViewerOpen, setPdfViewerOpen] = React.useState(false);
    const [pdfViewerUrl, setPdfViewerUrl] = React.useState('');

    const page_info = 'Home > 운영관리 > 공지관리';

    // @ts-ignore
    const columns: GridColDef<(typeof rows)[number]>[] = [
      {   
          field: 'id', 
          headerName: 'No', 
          type: 'string',
          flex: 0.1,             
          disableColumnMenu: true, 
      },
      {
          field: 'notice_title',
          headerName: '공제제목',
          type: 'string',
          flex: 1,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'notice_desctription',
          headerName: '공지내용',
          type: 'string',
          flex: 2,
          disableColumnMenu: true,
          editable: false,
      },
      {
          field: 'notice_type',
          headerName: '댓글 수',
          type: 'string',
          flex: 0.2,
          disableColumnMenu: true,
          editable: false,
      },
      {
        field: 'detail',
        headerName: '상세정보',
        flex: 0.3,
        disableColumnMenu: true,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '12px' }}
                onClick={(event) => {
                    event.stopPropagation();
                    handleOpenDialog(filterNoticeList[params.row.id - 1]);
                }}
            >
                보기
            </Button>
        ),
      },
    ];

    React.useEffect(()=>{
  
      try{

          if (ref_Div.current) {

            const offsetHeight = ref_Div.current.offsetHeight;
            const offsetWidth = ref_Div.current.offsetWidth;
            
            console.log('Height:', offsetHeight, 'Width:', offsetWidth);

            ref_Grid.current = offsetHeight - 0;

            get_UserInfo();

          }

      }catch(error){

        console.error('Error getting dimensions:', error);

      }

    },[]);

    React.useEffect(()=>{

    },[noticeList]);

    React.useEffect(()=>{

    },[filterNoticeList]);

    const get_UserInfo = async() => {
        setLoading(true);
        try {
            const response = await fetch('/api/manage/noticeInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagingIdx, filterInfo }),
            });

            const data = await response.json();

            if (response.ok) {
                setNoticeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
                setFilterNoticeList(data.result_data.map((data, idx) => ({ id: idx + 1, ...data })));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleChangeFilterContentType = (event: SelectChangeEvent<number>) => {

        try{

          setFilterContentTypeMethod(Number(event.target.value)); 

          switch(event.target.value){

            case 10:{

              setFilterContentTypeValueMethod('all');
            }break;
            case 20:{

              setFilterContentTypeValueMethod('phone');
            }break;
            case 30:{

              setFilterContentTypeValueMethod('mb_id');
            }break;
            case 40:{

              setFilterContentTypeValueMethod('mb_name');
            }break;
            default:{ 

              setFilterContentTypeValueMethod('all');
            }break;  

          }

        }catch(error){

            console.log(error);

        }
    };

    const handleChangeFilterType = (event: SelectChangeEvent<number>) => {

      try{

        setFilterStatusMethod(Number(event.target.value));

        switch(event.target.value){

          case 10:{
            setFilterStatusValueMethod('all');
          }break;
          case 20:{
            setFilterStatusValueMethod('0');
          }break;
          case 30:{
            setFilterStatusValueMethod('1');
          }break;
          case 40:{
            setFilterStatusValueMethod('2');
          }break;
          case 50:{
            setFilterStatusValueMethod('3');
          }break;
          default:{
            setFilterStatusValueMethod('all');
          }break;

        }

      }catch(error){  

        console.log(error);

      } 

    };  

    const handleClickDeleteKeyword = () => {

      try{

        setFilterInfo('');

      }catch(error){

        console.log(error);

      }

    };

    const handleClickSearch = () => {

      try{

        let filteredList = [...noticeList];

        if(filterStatusValueMethod === 'all') {

          if(filterInfo.length > 0) {
            
            switch(filterContentTypeValueMethod) {
              case 'target': {
                filteredList = filteredList.filter((user) => 
                  user.phone?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo))
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;

              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          
          }else{

            filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
          
          }

        } else {
          // sell_status 비교 전에 공백 제거
          const normalizedStatus = filterStatusValueMethod.trim();

          
          if(filterInfo.length > 0) {

            switch(filterContentTypeValueMethod) {
              case 'target': {
                filteredList = filteredList.filter((user) => 
                  user.target?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_id': {
                filteredList = filteredList.filter((user) => 
                  user.mb_id?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              case 'mb_name': {
                filteredList = filteredList.filter((user) => 
                  user.mb_name?.includes(filterInfo) && 
                  user.auth_type?.toString() === normalizedStatus)
                  .map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
              default: {
                filteredList = filteredList.map((user, idx) => ({ ...user, id: idx + 1 }));
              } break;
            }
          } else {


            filteredList = filteredList.filter((user) => 
              user.auth_type?.toString() == normalizedStatus)
              .map((user, idx) => ({ ...user, id: idx + 1 }));
          }
        }

        setFilterNoticeList(filteredList);
          
      }catch(error){

        console.log(error);

      }

    };

    // Custom Pagination Component
    function CustomPagination() {
      
      const apiRef = useGridApiContext();
      const page = useGridSelector(apiRef, gridPageSelector);
      const pageCount = useGridSelector(apiRef, gridPageCountSelector);

      return (
        <Box
            sx={{
                display: 'flex',
                width: 'auto',
                marginLeft: 'auto',
                marginRight: 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2
            }}
        >
            <IconButton
                onClick={() => apiRef.current.setPage(0)}
                disabled={page === 0}
                sx={{ padding: '4px' }}
            >
                <FirstPageIcon />
            </IconButton>
            <GridPagination />
            <IconButton
                onClick={() => apiRef.current.setPage(pageCount - 1)}
                disabled={page === pageCount - 1}
                sx={{ padding: '4px' }}
            >
                <LastPageIcon />
            </IconButton>
        </Box>
      );
    
    };

    const handleOpenDialog = (notice) => {
        setSelectedContent({
            ...notice,
            commentEnabled: notice.comment_flag === 'Y'
        });
        setImageFiles([
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' }
        ]);
        setVideoFile(null);
        setVideoPreview('');
        setPdfFile(null);
        setPdfPreview('');
        setActiveTab(0);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedContent({
            contentID: '',
            contentTitle: '',
            commentEnabled: false
        });
        setImageFiles([
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' }
        ]);
        setVideoFile(null);
        setVideoPreview('');
        setPdfFile(null);
        setPdfPreview('');
    };

    // 이미지 파일 처리 함수 추가
    const handleImageChange = (index: number) => async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // 파일 크기 체크 (예: 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('이미지 파일은 5MB 이하만 가능합니다.');
                return;
            }

            // 이미지 파일 타입 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const newImageFiles = [...imageFiles];
                newImageFiles[index] = {
                    file: file,
                    preview: reader.result as string
                };
                setImageFiles(newImageFiles);
            };
            reader.readAsDataURL(file);
        }
    };

    // 동영상 파일 처리 함수 추가
    const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // 파일 크기 체크 (예: 50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('동영상 파일은 50MB 이하만 가능합니다.');
                return;
            }

            // 비디오 파일 타입 체크
            if (!file.type.startsWith('video/')) {
                alert('동영상 파일만 업로드 가능합니다.');
                return;
            }

            setVideoFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 이미지 오류 처리 함수 추가
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/placeholder.jpg'; // 기본 이미지로 대체
    };

    // 이미지 삭제 함수 개선
    const handleDeleteImage = (index: number) => {
        // 1. 현재 모든 이미지 정보 수집
        const allImages: { file: File | null; preview: string; dbKey?: string; dbValue?: any }[] = [];
        
        for (let i = 0; i < 4; i++) { // 5개에서 4개로 변경
            const imageKey = `notice_picture${i > 0 ? i + 1 : ''}`;
            
            // 지금 삭제하려는 이미지는 제외
            if (i === index) continue;
            
            // 첫번째로 체크: 새로 업로드된 이미지
            if (imageFiles[i].file) {
                allImages.push({
                    file: imageFiles[i].file,
                    preview: imageFiles[i].preview
                });
            } 
            // 두번째로 체크: DB에 있는 기존 이미지
            else if (selectedContent[imageKey]) {
                allImages.push({
                    file: null,
                    preview: '',
                    dbKey: imageKey,
                    dbValue: selectedContent[imageKey]
                });
            }
        }
        
        console.log('정렬 전 이미지:', allImages);
        
        // 2. 새 이미지 파일 배열 생성 및 초기화
        const newImageFiles: ImageFile[] = Array(5).fill(null).map(() => ({ file: null, preview: '' }));
        
        // 3. UI에 보여줄 이미지 배열을 재배치
        allImages.forEach((img, idx) => {
            newImageFiles[idx] = {
                file: img.file,
                preview: img.file ? img.preview : ''
            };
        });
        
        // 4. selectedContent 객체 업데이트 (DB에 저장된 이미지 필드 초기화)
        const updatedContent = { ...selectedContent };
        
        // 먼저 이미지 필드 null로 초기화 (notice_picture5는 PDF용으로 제외)
        for (let i = 0; i < 4; i++) { // 5개에서 4개로 변경
            const imageKey = `notice_picture${i > 0 ? i + 1 : ''}`;
            updatedContent[imageKey] = null;
        }
        
        // 기존 DB 이미지 재배치
        allImages.forEach((img, idx) => {
            if (img.dbKey && img.dbValue) {
                const newKey = `notice_picture${idx > 0 ? idx + 1 : ''}`;
                updatedContent[newKey] = img.dbValue;
            }
        });
        
        console.log('이미지 재배치 결과:', {
            newImageFiles,
            updatedContent: Object.keys(updatedContent)
                .filter(key => key.startsWith('notice_picture'))
                .reduce((obj, key) => ({ ...obj, [key]: updatedContent[key] }), {})
        });
        
        setImageFiles(newImageFiles);
        setSelectedContent(updatedContent);
    };
    
    // 비디오 삭제 함수 개선
    const handleDeleteVideo = () => {
        setVideoFile(null);
        setVideoPreview('');
        
        // 선택된 콘텐츠에서도 비디오 경로 명시적으로 제거 (수정 모드)
        if (dialogOpen) {
            setSelectedContent((prev) => ({
                ...prev,
                notice_movie: null
            }));
        }
    };

    // 수정 처리 함수 - PDF 처리 추가
    const handleEdit = async () => {
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('noticeId', selectedContent.notice_no);
            // @ts-ignore
            formData.append('title', selectedContent.notice_title);
            // @ts-ignore
            formData.append('description', selectedContent.notice_desctription);

            // 댓글 기능 상태를 명시적으로 Y/N으로 설정
            const commentFlag = selectedContent.commentEnabled ? 'Y' : 'N';
            formData.append('comment_flag', commentFlag);

            // 삭제할 이미지 키 목록 생성
            const imageKeysToRemove: string[] = [];
            
            // DB에 저장된 이미지 필드 중 null로 설정된 것들을 삭제 대상으로 지정
            for (let i = 0; i < 4; i++) { // 5개에서 4개로 변경
                const imageKey = `notice_picture${i > 0 ? i + 1 : ''}`;
                if (selectedContent[imageKey] === null) {
                    imageKeysToRemove.push(imageKey);
                }
            }
            
            // PDF 필드가 null이면 삭제 목록에 추가
            if (selectedContent.notice_picture5 === null) {
                imageKeysToRemove.push('notice_picture5');
            }
            
            // 삭제할 이미지 키 목록 추가
            if (imageKeysToRemove.length > 0) {
                formData.append('imageKeysToRemove', JSON.stringify(imageKeysToRemove));
                console.log('삭제할 이미지 키:', imageKeysToRemove);
            }

            // 새 이미지 파일 처리 (재배치된 순서대로 추가)
            let addedImageCount = 0;
            imageFiles.forEach((imageFile, index) => {
                if (index < 4 && imageFile.file) { // 최대 4개 이미지만 처리
                    // 이미지 인덱스를 1부터 시작하는 연속된 번호로 추가
                    addedImageCount++;
                    formData.append(`image${addedImageCount}`, imageFile.file);
                    console.log(`이미지 ${addedImageCount} 추가:`, imageFile.file.name);
                }
            });
            
            // PDF 파일 추가 - PDF 파일은 서버에서 notice_picture5 필드에 저장
            if (pdfFile) {
                formData.append('pdf', pdfFile);
                console.log('PDF 파일 추가:', pdfFile.name);
            }

            // 비디오 파일 추가
            if (videoFile) {
                formData.append('video', videoFile);
            } else if (selectedContent.notice_movie === null) {
                // 비디오가 삭제됨을 명시적으로 표시
                formData.append('removeVideo', 'true');
            }

            console.log('수정 요청 데이터:', Object.fromEntries(formData.entries()));

            const response = await fetch('/api/manage/updateNotice', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('공지사항 수정에 실패했습니다.');
            }

            const data = await response.json();
            
            if (data.success) {
                alert('공지사항이 성공적으로 수정되었습니다.');
                handleCloseDialog();
                get_UserInfo(); // 목록 새로고침
            } else {
                throw new Error(data.message || '공지사항 수정에 실패했습니다.');
            }

        } catch (error) {
            console.error('수정 중 오류 발생:', error);
            alert('공지사항 수정 중 오류가 발생했습니다.');
        }
    };

    // 삭제 처리 함수
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch('/api/manage/deleteNotice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  // @ts-ignore
                    noticeId: selectedContent.notice_no
                }),
            });

            if (!response.ok) {
                throw new Error('공지사항 삭제에 실패했습니다.');
            }

            const data = await response.json();
            
            if (data.success) {
                alert('공지사항이 성공적으로 삭제되었습니다.');
                handleCloseDialog();
                get_UserInfo(); // 목록 새로고침
            } else {
                throw new Error(data.message || '공지사항 삭제에 실패했습니다.');
            }

        } catch (error) {
            console.error('삭제 중 오류 발생:', error);
            alert('공지사항 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleOpenRegisterDialog = () => {
        setActiveTab(0);
        setPdfFile(null);
        setPdfPreview('');
        setRegisterDialogOpen(true);
    };

    const handleCloseRegisterDialog = () => {
        setRegisterDialogOpen(false);
        setImageFiles([
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' },
            { file: null, preview: '' }
        ]);
        setVideoFile(null);
        setVideoPreview('');
        setPdfFile(null);
        setPdfPreview('');
    };

    // 등록 처리 함수 - PDF 처리 추가
    const handleRegister = async () => {
        try {
            // 클라이언트 측 유효성 검사
            if (!selectedContent.contentTitle?.trim()) {
                alert('공지 제목을 입력해주세요.');
                return;
            }
            // @ts-ignore
            if (!selectedContent.notice_desctription?.trim()) {
                alert('공지 내용을 입력해주세요.');
                return;
            }

            const formData = new FormData();
            formData.append('title', selectedContent.contentTitle.trim());
            // @ts-ignore
            formData.append('description', selectedContent.notice_desctription.trim());
            // @ts-ignore
            formData.append('comment_flag', selectedContent.commentEnabled === true ? 'Y' : 'N');

            // 이미지 파일 추가 - 최대 4개로 제한
            imageFiles.forEach((imageFile, index) => {
                if (index < 4 && imageFile.file) { // 최대 4개 이미지만 처리
                    formData.append(`image${index + 1}`, imageFile.file);
                }
            });
            
            // PDF 파일 추가
            if (pdfFile) {
                formData.append('pdf', pdfFile);
            }

            // 비디오 파일 추가
            if (videoFile) {
                formData.append('video', videoFile);
            }

            const response = await fetch('/api/manage/createNotice', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                handleCloseRegisterDialog();
                get_UserInfo();
            } else {
                throw new Error(data.message || '공지사항 등록에 실패했습니다.');
            }

        } catch (error) {
            console.error('등록 중 오류 발생:', error);
            alert(error.message || '공지사항 등록 중 오류가 발생했습니다.');
        }
    };

    // 미디어 섹션 토글 함수
    const toggleMediaSection = (section: 'images' | 'video' | 'pdf') => {
        setMediaExpanded({
            ...mediaExpanded,
            [section]: !mediaExpanded[section]
        });
    };

    // 탭 변경 핸들러
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // 다중 이미지 선택 처리 함수 추가
    const handleMultipleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            
            // 파일 크기와 타입 체크
            const validFiles = files.filter(file => {
                if (file.size > 5 * 1024 * 1024) {
                    console.warn(`${file.name} 파일이 5MB를 초과합니다.`);
                    return false;
                }
                if (!file.type.startsWith('image/')) {
                    console.warn(`${file.name}은 이미지 파일이 아닙니다.`);
                    return false;
                }
                return true;
            });
            
            // 최대 5개까지만 처리
            const filesToProcess = validFiles.slice(0, 5);
            
            // 미리보기 생성 및 상태 업데이트
            const newImageFiles = [...imageFiles];
            
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                const reader = new FileReader();
                
                // 비동기 처리를 위한 Promise 래핑
                await new Promise<void>((resolve) => {
                    reader.onload = () => {
                        newImageFiles[i] = {
                            file: file,
                            preview: reader.result as string
                        };
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
            
            setImageFiles(newImageFiles);
        }
    };

    // PDF 파일 처리 함수 추가
    const handlePdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // 파일 크기 체크 (예: 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('PDF 파일은 10MB 이하만 가능합니다.');
                return;
            }

            // PDF 파일 타입 체크
            if (file.type !== 'application/pdf') {
                alert('PDF 파일만 업로드 가능합니다.');
                return;
            }

            setPdfFile(file);
            
            // PDF 파일 미리보기 URL 생성 (파일명만 표시)
            setPdfPreview(file.name);
        }
    };
    
    // PDF 삭제 함수 추가
    const handleDeletePdf = () => {
        setPdfFile(null);
        setPdfPreview('');
        
        // 선택된 콘텐츠에서도 PDF 경로 명시적으로 제거 (수정 모드)
        if (dialogOpen) {
            setSelectedContent((prev) => ({
                ...prev,
                notice_picture5: null
            }));
        }
    };

    // PDF 뷰어 열기 함수
    const handleOpenPdfViewer = (url: string) => {
        setPdfViewerUrl(url);
        setPdfViewerOpen(true);
    };
    
    // PDF 뷰어 닫기 함수
    const handleClosePdfViewer = () => {
        setPdfViewerOpen(false);
        setPdfViewerUrl('');
    };

    // PDF 파일 URL 가져오기 함수 추가
    const getPdfProxyUrl = (pdfUrl: string) => {
        // 이미 S3 URL인 경우, 파일 키만 추출
        if (pdfUrl && pdfUrl.includes('plastichero-assets.s3')) {
            // URL에서 키 부분만 추출 (s3.amazonaws.com/ 이후 부분)
            const keyMatch = pdfUrl.match(/amazonaws\.com\/(.*)/);
            if (keyMatch && keyMatch[1]) {
                return `/api/file?key=${encodeURIComponent(keyMatch[1])}`; 
            }
        }
        // 그렇지 않으면 직접 URL 반환
        return pdfUrl;
    };

    return (

      <div style={{display:'flex', flexDirection:'column',  width:'100%', height:'100vh',  paddingLeft:'20px', paddingRight:'20px',}}>

        <div style={{display:'flex', flexDirection:'row', marginTop:'20px'}}>

            <p style={{color:'#1f1f26', fontSize:13}}>{page_info}</p>

        </div>

        <div style={{}}>
            <Typography sx={{fontSize:"20px",  color: '#1f1f26', marginLeft:"0px", marginTop:"10px", fontWeight:'bold' }}>
                공지관리
            </Typography>
        </div>

        <div style={{ marginTop: '5px', display:'none' }}>

            <Grid container spacing={2}>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          총 요청수
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {noticeList.length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>

                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          지갑생성
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                          {noticeList.filter(user => user.auth_type === '0').length.toLocaleString()}
                        </Typography>

                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                          지갑 불러오기
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {noticeList.filter(user => user.auth_type === '1').length.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={2.4}>
                    <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%' }}>
                        
                        <Typography variant="h6" sx={{ color: '#1f1f26', fontSize: '14px', mb: 1 }}>
                            기타
                        </Typography>
                        <Typography sx={{fontSize: "24px", fontWeight: "bold", color: "#1f1f26"}}>
                            {noticeList.filter(user => user.auth_type === '2').length.toLocaleString()}
                        </Typography>
                        
                    </Box>
                </Grid>
            </Grid>
        </div>

        <div style={{
          
          display:"flex", 
          float:"left",  
          marginTop:'10px', 
          paddingTop:"15px", 
          paddingBottom:"10px", 
          paddingLeft:"10px",
          width:"100%", 
          borderRadius:'5px', 
          borderColor:'#f1f1f1', 
          borderWidth:'2px', 
          backgroundColor:'#efefef',
          alignContent:'center',
          alignItems:'center',
          
          }}>
      
            <div style={{display:"flex", float:"left"}}>

              <FormControl fullWidth  style={{ width:"175px",marginTop:"0px", marginLeft:"8px", backgroundColor:'white', color:'black'}}>
                  <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  style={{color:'black'}}
                  value={filterStatusMethod}
                  size="small"
                  onChange={handleChangeFilterType}
                  >
                  <MenuItem style={{fontSize:13}} value={10}>전체</MenuItem>
                  <MenuItem style={{fontSize:13}} value={20}>지갑생성</MenuItem>
                  <MenuItem style={{fontSize:13}} value={30}>지갑 불러오기</MenuItem>
                  <MenuItem style={{fontSize:13}} value={40}>기타</MenuItem>
                  </Select>
              </FormControl>

            </div>


            <div style={{display:"flex", float:"left", marginLeft:"auto", width:"100%"}}>

              <FormControl fullWidth sx={{ 
                  width: "110px", 
                  marginTop: "0px", 
                  marginLeft: "auto",
                  '& .MuiOutlinedInput-root': {
                      height: '33px',
                      backgroundColor: 'white'
                  },
                  '& .MuiInputLabel-root': {
                      fontSize: '14px'
                  }
              }}>
                  <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      sx={{
                          color: 'black',
                          height: '33px',
                          '& .MuiSelect-select': {
                              height: '33px',
                              padding: '0 14px',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '14px'
                          }
                      }}
                      value={filterContentTypeMethod}
                      size="small"
                      onChange={handleChangeFilterContentType}
                  >
                      <MenuItem style={{fontSize:14}} value={10}>전체</MenuItem>
                      <MenuItem style={{fontSize:14}} value={20}>이메일주소</MenuItem>
                      <MenuItem style={{fontSize:14}} value={30}>사용자ID</MenuItem>
                      <MenuItem style={{fontSize:14}} value={40}>사용자명</MenuItem>
                  </Select>
              </FormControl>
            </div>

            <Box
              component="form"
              marginLeft="10px"
              marginRight="5px"
              noValidate
              style={{marginLeft:'5px'}}
              autoComplete="off">

              <FormControl sx={{minWidth: '300px' }} variant="outlined">
                  <InputLabel 
                      id='keywordLabel' 
                      size="small" 
                      sx={{
                          height: "40px",
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          '&.MuiInputLabel-root': {
                              marginBottom: '0px',
                              transform: 'translate(14px, -2px)',
                              '&.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -14px) scale(0.75)'
                              }
                          }
                      }}
                  >
                      키워드를 입력하세요
                  </InputLabel>
                  <OutlinedInput
                      sx={{
                          height: '33px',
                          backgroundColor:'white',
                          fontSize: '14px',
                          '& .MuiOutlinedInput-input': {
                              fontSize: '14px',
                              padding: '0 14px',
                              height: '33px',
                              display: 'flex',
                              alignItems: 'center'
                          },
                          '& input': {
                              paddingTop: 0,
                              paddingBottom: 0,
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center'
                          }
                      }}
                      id="keywordInfoField"
                      type='text'
                      value={filterInfo}
                      onChange={(text)=>{ 
                          setFilterInfo(text.target.value);
                      }}
                      endAdornment={
                          <InputAdornment position="end">
                              <ClearIcon onClick={handleClickDeleteKeyword} />
                          </InputAdornment>
                      }
                      label="키워드를 입력하세요"
                  />
              </FormControl>
            </Box>
            <Button 
              id="keyBtns" 
              variant="outlined" 
              style={{
                color:"white", 
                backgroundColor:"#1f1f26", 
                borderColor:"#CBCBCB",
                height:"33px",
                marginRight:"5px",
                fontSize: '14px'
              }}  
              onClick={handleClickSearch}
            >
              검색
            </Button>

            <Button 
              variant="contained" 
              style={{
                color:"white", 
                backgroundColor:"#4CAF50", 
                height:"33px",
                marginRight:"5px",
                fontSize: '14px'
              }}  
              onClick={handleOpenRegisterDialog}
            >
              등록
            </Button>

        </div>

        <div ref={ref_Div} style={{
          flex: 1, 
          height: '100%', 
          marginTop: '0px', 
          paddingLeft: "0px",
          width: '100%'
        }}>

          <StripedDataGrid 

          rows={filterNoticeList}
          columns={columns}
          autoHeight={true}

          initialState={{
              pagination: {
                  paginationModel: {
                  pageSize: 10,
                  },
              },
          }}
          pageSizeOptions={[10]}
          rowHeight={42}
          columnHeaderHeight={60}

          slots={{
              pagination: CustomPagination,
          }}

          localeText={{
              toolbarExportCSV: "CVS 파일 저장",
              toolbarColumns: "헤더설정",
              toolbarFilters: "내부필터링",
              toolbarExport: "다운로드",
              MuiTablePagination: {
                  labelDisplayedRows: ({ from, to, count }) => {
                      if (from === undefined || to === undefined || count === undefined) {
                          return '0-0 / 0';
                      }
                      return `${from.toLocaleString('ko-KR')}-${to.toLocaleString('ko-KR')} / ${count.toLocaleString('ko-KR')}`;
                  }
              }
          }}

          slotProps={{
              toolbar: {
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: true },
              },
              pagination: {
                  labelRowsPerPage: "페이지당 행:",
                  labelDisplayedRows: ({ from, to, count }) => 
                      `${from.toLocaleString('ko-KR')}-${to.toLocaleString('ko-KR')} / ${count.toLocaleString('ko-KR')}`
              }
          }}
          sx={{

              '.MuiDataGrid-columnSeparator': {
              display: 'none',
              },
              "& .MuiDataGrid-columnHeader": {
                  borderTopColor:"green",
                  borderBlockColor:"green",
                  color: "#000000",
                  fontSize:13.5,
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
              },
              '& .super-app-theme--Open': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--Filled': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--PartiallyFilled': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              '& .super-app-theme--Rejected': {
                  '&.Mui-selected': { backgroundColor: 'black'},
              },
              "& .MuiDataGrid-cell": {
                  border: 1,
                  borderColor:"#f4f6f6",
                  borderRight: 0,
                  borderTop: 0,
                  fontSize:13.5,
              },
              '& .MuiMenuItem-root': {
                      fontSize: 1,
                  },
                  '& .MuiTypography-root': {
                      color: 'dodgerblue',
                      fontSize: 1,
                  },
                  '& .MuiDataGrid-filterForm': {
                      bgcolor: 'lightblue',
                  },
              '& .MuiDataGrid-footerContainer': {
                  justifyContent: 'center',
              },
              '& .MuiTablePagination-root': {
                  fontSize: '13.5px',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
              },
              '& .MuiTablePagination-toolbar': {
                  justifyContent: 'center',
                  width: '100%',
              },
              '& .MuiTablePagination-actions': {
                  marginLeft: '0px',
              },
              '& .MuiTablePagination-displayedRows': {
                  fontSize: '13.5px',
              },
              '& .MuiTablePagination-selectLabel': {
                  fontSize: '13.5px',
              },
              '& .MuiTablePagination-select': {
                  fontSize: '13.5px',
              },
          }}
          getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
          }
          style={{

            marginTop:'20px',

          }}

          />

        </div>


        <Backdrop open={loading} sx={{ color: '#fff', display: 'flex', flexDirection: 'column', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="inherit">공지 정보를 불러오는 중입니다</Typography>
        </Backdrop>

        <Dialog 
            open={dialogOpen} 
            onClose={handleCloseDialog} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    p: 2,
                    flex: '0 0 auto'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1 
                }}>
                    <DescriptionIcon sx={{ fontSize: 20 }} />
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        상세정보
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent 
                sx={{
                    p: 2.5,
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {/* 탭 추가 */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                fontSize: '13px',
                                minHeight: '40px',
                                padding: '8px 16px'
                            }
                        }}
                    >
                        <Tab label="내용" />
                        <Tab label="미디어" />
                    </Tabs>
                </Box>
                
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <Grid container spacing={2} sx={{ display: activeTab === 0 ? 'flex' : 'none', overflow: 'auto', flex: 1 }}>
                    <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <DescriptionIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    공지 제목
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                // @ts-ignore
                                value={selectedContent?.notice_title || ''}
                                size="small"
                                onChange={(e) => setSelectedContent({
                                    ...selectedContent,
                                    // @ts-ignore
                                    notice_title: e.target.value
                                })}
                                sx={{ 
                                    mt: 1,
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                    }
                                }}
                            />
                            <Divider sx={{ mt: 2, mb: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <DescriptionIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    공지 내용
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={12} // 공지 내용 영역 확장
                                // @ts-ignore
                                value={selectedContent?.notice_desctription || ''}
                                onChange={(e) => setSelectedContent({
                                    ...selectedContent,
                                    // @ts-ignore
                                    notice_desctription: e.target.value
                                })}
                                sx={{ 
                                    mt: 1,
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ display: activeTab === 1 ? 'flex' : 'none', overflow: 'auto', flex: 1 }}>
                    <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.2, 
                                    mb: 0.8,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.8
                                    }
                                }}
                                onClick={() => toggleMediaSection('images')}
                            >
                                <ImageIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexGrow: 1
                                }}>
                                    이미지 파일
                                </Typography>
                                {/* 다중 이미지 업로드 버튼 추가 */}
                                <Button
                                    component="label"
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        fontSize: '11px',
                                        height: '24px',
                                        padding: '0 8px',
                                        minWidth: 'auto',
                                        mr: 1,
                                        color: '#1976d2',
                                        borderColor: '#1976d2',
                                        '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    이미지 일괄 선택
                                    <VisuallyHiddenInput 
                                        type="file" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageChange}
                                    />
                                </Button>
                                {mediaExpanded.images ? 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▼</Box> : 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▶</Box>}
                            </Box>
                            
                            {mediaExpanded.images && (
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1,
                                mt: 1,
                                overflowX: 'auto',
                                pb: 1,
                            }}>
                                {[1, 2, 3, 4].map((num) => ( // 5개에서 4개로 변경
                                    <Box 
                                        key={num} 
                                        sx={{ 
                                            flex: '0 0 100px',
                                            minWidth: '100px',
                                                position: 'relative'
                                        }}
                                    >
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            sx={{ 
                                                width: '100px',
                                                height: '100px',
                                                border: '1px dashed #ccc',
                                                fontSize: '12px',
                                                color: '#666',
                                                padding: 0,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                minWidth: 'auto',
                                                '&:hover': {
                                                    borderColor: '#1976d2',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                                }
                                            }}
                                        >
                                            {imageFiles[num-1]?.preview ? (
                                                <Box
                                                    component="img"
                                                    src={imageFiles[num-1].preview}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : selectedContent?.[`notice_picture${num > 1 ? num : ''}`] ? (
                                                    isS3File(selectedContent[`notice_picture${num > 1 ? num : ''}`] as string) ? (
                                                <Box
                                                    component="img"
                                                            src={selectedContent[`notice_picture${num > 1 ? num : ''}`].startsWith('http') 
                                                                ? selectedContent[`notice_picture${num > 1 ? num : ''}`] as string
                                                                : `/api/file?key=${encodeURIComponent(selectedContent[`notice_picture${num > 1 ? num : ''}`] as string)}`
                                                            }
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                            onError={handleImageError}
                                                        />
                                                    ) : (
                                                        <Box
                                                            component="img"
                                                            src={selectedContent[`notice_picture${num > 1 ? num : ''}`]}
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                />
                                                    )
                                            ) : (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <ImageIcon sx={{ fontSize: 20 }} />
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        이미지 {num}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <VisuallyHiddenInput 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(num-1)(e)}
                                            />
                                        </Button>
                                            
                                            {/* 삭제 버튼 추가 - 위치 및 스타일 개선 */}
                                            {(imageFiles[num-1]?.preview || selectedContent?.[`notice_picture${num > 1 ? num : ''}`]) && (
                                                <IconButton 
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                        color: 'white',
                                                        border: '1px solid #f44336',
                                                        width: 28,
                                                        height: 28,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#f44336',
                                                            transform: 'scale(1.1)'
                                                        },
                                                        zIndex: 10,
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(num-1);
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            )}
                                    </Box>
                                ))}
                            </Box>
                            )}
                            <Divider sx={{ mt: 2, mb: 1 }} />
                    </Grid>

                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.2, 
                                    mb: 0.8,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.8
                                    }
                                }}
                                onClick={() => toggleMediaSection('video')}
                            >
                                <VideoLibraryIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexGrow: 1
                                }}>
                                    동영상 파일
                                </Typography>
                                {mediaExpanded.video ? 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▼</Box> : 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▶</Box>}
                            </Box>
                            
                            {mediaExpanded.video && (
                                <Box sx={{ position: 'relative' }}>
                            <Button
                                component="label"
                                variant="outlined"
                                // @ts-ignore
                                startIcon={!videoPreview && !selectedContent?.notice_movie && <VideoLibraryIcon />}
                                sx={{ 
                                    width: '100%',
                                            height: 'auto',
                                            minHeight: '300px',
                                    border: '1px dashed #ccc',
                                    fontSize: '13px',
                                    color: '#666',
                                    mt: 1,
                                    padding: 0,
                                    overflow: 'hidden',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                }}
                            >
                                {videoPreview ? (
                                    <Box
                                        component="video"
                                        src={videoPreview}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                                    maxHeight: '500px',
                                                    objectFit: 'contain',
                                                    backgroundColor: '#000'
                                        }}
                                        controls
                                    />
                                ) : 
                                    selectedContent?.notice_movie ? (
                                            isS3File(selectedContent.notice_movie as string) ? (
                                    <Box
                                        component="video"
                                                    src={selectedContent.notice_movie.startsWith('http')
                                                        ? selectedContent.notice_movie as string
                                                        : `/api/file?key=${encodeURIComponent(selectedContent.notice_movie as string)}`
                                                    }
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                                        maxHeight: '500px',
                                                        objectFit: 'contain',
                                                        backgroundColor: '#000'
                                        }}
                                        controls
                                                    onError={(e) => {
                                                        console.error('비디오 로드 오류:', e);
                                                    }}
                                    />
                                ) : (
                                                <Box
                                                    component="video"
                                                    src={selectedContent.notice_movie}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        maxHeight: '500px',
                                                        objectFit: 'contain',
                                                        backgroundColor: '#000'
                                                    }}
                                                    controls
                                                />
                                            )
                                        ) : (
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <VideoLibraryIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                                                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                                                    동영상 파일을 업로드하세요
                                                </Typography>
                                                <Typography sx={{ fontSize: '12px', color: '#999', mt: 1 }}>
                                                    (최대 50MB, MP4, WebM, Ogg 형식 지원)
                                                </Typography>
                                            </Box>
                                )}
                                <VisuallyHiddenInput 
                                    type="file" 
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                />
                            </Button>
                                    
                                    {/* 비디오 삭제 버튼 추가 - 위치 및 스타일 개선 */}
                                    {(videoPreview || selectedContent?.notice_movie) && (
                                        <IconButton 
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                color: 'white',
                                                border: '1px solid #f44336',
                                                width: 28,
                                                height: 28,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#f44336',
                                                    transform: 'scale(1.1)'
                                                },
                                                zIndex: 10,
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                            onClick={handleDeleteVideo}
                                        >
                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    )}
                                </Box>
                            )}
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.2, 
                                    mb: 0.8,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.8
                                    }
                                }}
                                onClick={() => toggleMediaSection('pdf')}
                            >
                                <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexGrow: 1
                                }}>
                                    PDF 파일
                                </Typography>
                                {mediaExpanded.pdf ? 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▼</Box> : 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▶</Box>}
                            </Box>
                            
                            {mediaExpanded.pdf && (
                                <Box sx={{ position: 'relative' }}>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={!pdfPreview && !selectedContent?.notice_picture5 && <PictureAsPdfIcon />}
                                        sx={{ 
                                            width: '100%',
                                            height: '80px',
                                            border: '1px dashed #ccc',
                                            fontSize: '13px',
                                            color: '#666',
                                            mt: 1,
                                            padding: pdfPreview || selectedContent?.notice_picture5 ? 0 : '16px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {pdfPreview ? (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                width: '100%', 
                                                height: '100%',
                                                p: 2
                                            }}>
                                                <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 24, mr: 1 }} />
                                                <Typography sx={{ fontSize: '14px', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {pdfPreview}
                                                </Typography>
                                            </Box>
                                        ) : 
                                            selectedContent?.notice_picture5 && selectedContent.notice_picture5.endsWith('.pdf') ? (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    width: '100%', 
                                                    height: '100%',
                                                    p: 2
                                                }}>
                                                    <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 24, mr: 1 }} />
                                                    <Typography sx={{ fontSize: '14px', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {selectedContent.notice_picture5.split('/').pop()}
                                                    </Typography>
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        sx={{ ml: 1, minWidth: 'auto', p: '4px 8px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(getPdfProxyUrl(selectedContent.notice_picture5), '_blank');
                                                        }}
                                                    >
                                                        보기
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <>
                                                    <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 24, mb: 1 }} />
                                                    <Typography sx={{ fontSize: '13px' }}>
                                                        PDF 파일 추가
                                                    </Typography>
                                                </>
                                            )
                                        }
                                        <VisuallyHiddenInput 
                                            type="file" 
                                            accept="application/pdf"
                                            onChange={handlePdfChange}
                                        />
                                    </Button>
                                    
                                    {/* PDF 삭제 버튼 */}
                                    {(pdfPreview || (selectedContent?.notice_picture5 && selectedContent.notice_picture5.endsWith('.pdf'))) && (
                                        <IconButton 
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                color: 'white',
                                                border: '1px solid #f44336',
                                                width: 28,
                                                height: 28,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#f44336',
                                                    transform: 'scale(1.1)'
                                                },
                                                zIndex: 10,
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                            onClick={handleDeletePdf}
                                        >
                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    )}
                                </Box>
                            )}
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions 
                sx={{ 
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #eaeaea',
                    gap: 1,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CommentIcon sx={{ 
                        color: selectedContent.commentEnabled ? '#1976d2' : '#666',
                        fontSize: 20,
                        transition: 'color 0.3s ease'
                    }} />
                    <Typography sx={{ 
                        fontSize: '13px',
                        color: selectedContent.commentEnabled ? '#1976d2' : '#666',
                        mr: 1,
                        transition: 'color 0.3s ease',
                        fontWeight: selectedContent.commentEnabled ? 600 : 400
                    }}>
                        댓글 기능 {selectedContent.commentEnabled ? '사용' : '미사용'}
                    </Typography>
                    <Switch
                        size="small"
                        checked={selectedContent.commentEnabled}
                        onChange={(e) => setSelectedContent({
                            ...selectedContent,
                            commentEnabled: e.target.checked
                        })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#1976d2',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#1976d2',
                            },
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px'
                        }}
                    >
                        삭제
                    </Button>
                    <Button 
                        onClick={handleCloseDialog}
                        variant="outlined" 
                        startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            color: '#666',
                            borderColor: '#ccc',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        닫기
                    </Button>
                    <Button 
                        onClick={handleEdit}
                        variant="contained" 
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px'
                        }}
                    >
                        수정
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>

        {/* 등록 다이얼로그 추가 */}
        <Dialog 
            open={registerDialogOpen} 
            onClose={handleCloseRegisterDialog} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    p: 2,
                    flex: '0 0 auto'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1 
                }}>
                    <DescriptionIcon sx={{ fontSize: 20 }} />
                    <Typography 
                        component="span"
                        sx={{ 
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        공지사항 등록
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent 
                sx={{
                    p: 2.5,
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {/* 탭 추가 */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                fontSize: '13px',
                                minHeight: '40px',
                                padding: '8px 16px'
                            }
                        }}
                    >
                        <Tab label="내용" />
                        <Tab label="미디어" />
                    </Tabs>
                </Box>
                
                <Box sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    marginTop:'5px',
                    p: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    border: '1px solid #eaeaea',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Grid container spacing={2} sx={{ display: activeTab === 0 ? 'flex' : 'none', overflow: 'auto', flex: 1 }}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <DescriptionIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    공지 제목
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                onChange={(e) => setSelectedContent({
                                    ...selectedContent,
                                    contentTitle: e.target.value
                                })}
                                sx={{ 
                                    mt: 1,
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                    }
                                }}
                            />
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                                <DescriptionIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}>
                                    공지 내용
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={12} // 공지 내용 영역 확장
                                onChange={(e) => setSelectedContent({
                                    ...selectedContent,
                                    // @ts-ignore
                                    notice_desctription: e.target.value
                                })}
                                sx={{ 
                                    mt: 1,
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                    }
                                }}
                            />
                        </Grid>
                        </Grid>

                    <Grid container spacing={2} sx={{ display: activeTab === 1 ? 'flex' : 'none', overflow: 'auto', flex: 1 }}>
                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.2, 
                                    mb: 0.8,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.8
                                    }
                                }}
                                onClick={() => toggleMediaSection('images')}
                            >
                                <ImageIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexGrow: 1
                                }}>
                                    이미지 파일
                                </Typography>
                                {/* 다중 이미지 업로드 버튼 추가 */}
                                <Button
                                    component="label"
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        fontSize: '11px',
                                        height: '24px',
                                        padding: '0 8px',
                                        minWidth: 'auto',
                                        mr: 1,
                                        color: '#4CAF50',
                                        borderColor: '#4CAF50',
                                        '&:hover': {
                                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                        }
                                    }}
                                >
                                    이미지 일괄 선택
                                    <VisuallyHiddenInput 
                                        type="file" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageChange}
                                    />
                                </Button>
                                {mediaExpanded.images ? 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▼</Box> : 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▶</Box>}
                            </Box>
                            
                            {mediaExpanded.images && (
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1,
                                mt: 1,
                                overflowX: 'auto',
                                pb: 1,
                            }}>
                                {[1, 2, 3, 4].map((num) => ( // 5개에서 4개로 변경
                                    <Box 
                                        key={num} 
                                        sx={{ 
                                            flex: '0 0 100px',
                                            minWidth: '100px',
                                                position: 'relative'
                                        }}
                                    >
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            sx={{ 
                                                width: '100px',
                                                height: '100px',
                                                border: '1px dashed #ccc',
                                                fontSize: '12px',
                                                color: '#666',
                                                padding: 0,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                minWidth: 'auto',
                                                '&:hover': {
                                                    borderColor: '#4CAF50',
                                                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                                }
                                            }}
                                        >
                                            {imageFiles[num-1]?.preview ? (
                                                <Box
                                                    component="img"
                                                    src={imageFiles[num-1].preview}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <ImageIcon sx={{ fontSize: 20 }} />
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        이미지 {num}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <VisuallyHiddenInput 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(num-1)(e)}
                                            />
                                        </Button>
                                            
                                            {/* 삭제 버튼 추가 - 위치 및 스타일 개선 */}
                                            {imageFiles[num-1]?.preview && (
                                                <IconButton 
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                        color: 'white',
                                                        border: '1px solid #f44336',
                                                        width: 28,
                                                        height: 28,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#f44336',
                                                            transform: 'scale(1.1)'
                                                        },
                                                        zIndex: 10,
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(num-1);
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            )}
                                    </Box>
                                ))}
                            </Box>
                            )}
                            <Divider sx={{ mt: 2, mb: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.2, 
                                    mb: 0.8,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.8
                                    }
                                }}
                                onClick={() => toggleMediaSection('video')}
                            >
                                <VideoLibraryIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ 
                                    color: '#444',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    flexGrow: 1
                                }}>
                                    동영상 파일
                                </Typography>
                                {mediaExpanded.video ? 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▼</Box> : 
                                    <Box sx={{ fontSize: '16px', color: '#666' }}>▶</Box>}
                            </Box>
                            
                            {mediaExpanded.video && (
                                <Box sx={{ position: 'relative' }}>
                            <Button
                                component="label"
                                variant="outlined"
                                sx={{ 
                                    width: '100%',
                                            height: 'auto',
                                            minHeight: '300px',
                                    border: '1px dashed #ccc',
                                    fontSize: '13px',
                                    color: '#666',
                                    mt: 1,
                                    padding: 0,
                                    overflow: 'hidden',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                }}
                            >
                                {videoPreview ? (
                                    <Box
                                        component="video"
                                        src={videoPreview}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                                    maxHeight: '500px',
                                                    objectFit: 'contain',
                                                    backgroundColor: '#000'
                                        }}
                                        controls
                                    />
                                ) : (
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <VideoLibraryIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                                                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                                                    동영상 파일을 업로드하세요
                                                </Typography>
                                                <Typography sx={{ fontSize: '12px', color: '#999', mt: 1 }}>
                                                    (최대 50MB, MP4, WebM, Ogg 형식 지원)
                                                </Typography>
                                            </Box>
                                )}
                                <VisuallyHiddenInput 
                                    type="file" 
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                />
                            </Button>
                                    
                                    {/* 비디오 삭제 버튼 추가 - 위치 및 스타일 개선 */}
                                    {videoPreview && (
                                        <IconButton 
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                color: 'white',
                                                border: '1px solid #f44336',
                                                width: 28,
                                                height: 28,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#f44336',
                                                    transform: 'scale(1.1)'
                                                },
                                                zIndex: 10,
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                            onClick={handleDeleteVideo}
                                        >
                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions 
                sx={{ 
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #eaeaea',
                    gap: 1,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CommentIcon sx={{ 
                        color: selectedContent.commentEnabled ? '#4CAF50' : '#666',
                        fontSize: 20,
                        transition: 'color 0.3s ease'
                    }} />
                    <Typography sx={{ 
                        fontSize: '13px',
                        color: selectedContent.commentEnabled ? '#4CAF50' : '#666',
                        mr: 1,
                        transition: 'color 0.3s ease',
                        fontWeight: selectedContent.commentEnabled ? 600 : 400
                    }}>
                        댓글 기능 {selectedContent.commentEnabled ? '사용' : '미사용'}
                    </Typography>
                    <Switch
                        size="small"
                        checked={selectedContent.commentEnabled}
                        onChange={(e) => setSelectedContent({
                            ...selectedContent,
                            commentEnabled: e.target.checked
                        })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#4CAF50',
                                '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#4CAF50',
                            },
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        onClick={handleCloseRegisterDialog}
                        variant="outlined" 
                        startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            color: '#666',
                            borderColor: '#ccc',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handleRegister}
                        variant="contained" 
                        sx={{ 
                            fontSize: '13px',
                            height: '32px',
                            padding: '0 16px',
                            backgroundColor: '#4CAF50',
                            '&:hover': {
                                backgroundColor: '#45a049'
                            }
                        }}
                    >
                        등록
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>

        {/* PDF 뷰어 다이얼로그 추가 */}
        <Dialog
            open={pdfViewerOpen}
            onClose={handleClosePdfViewer}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <PictureAsPdfIcon sx={{ fontSize: 20 }} />
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        PDF 문서 보기
                    </Typography>
                </Box>
                <IconButton 
                    size="small" 
                    onClick={handleClosePdfViewer}
                    sx={{ color: 'white' }}
                >
                    <CancelIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent
                sx={{
                    p: 0,
                    flex: '1 1 auto',
                    overflow: 'hidden'
                }}
            >
                <Box 
                    component="iframe"
                    src={pdfViewerUrl}
                    sx={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                    }}
                />
            </DialogContent>
            <DialogActions
                sx={{
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #eaeaea'
                }}
            >
                <Button 
                    onClick={() => window.open(pdfViewerUrl, '_blank')} 
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    sx={{ mr: 'auto' }}
                >
                    새 창에서 열기
                </Button>
                <Button
                    onClick={handleClosePdfViewer}
                    variant="contained"
                    color="error"
                >
                    닫기
                </Button>
            </DialogActions>
        </Dialog>

      </div>
    );

  }
