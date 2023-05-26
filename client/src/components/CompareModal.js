import { Modal } from 'antd';
import htmr from 'htmr';
import { RightOutlined } from '@ant-design/icons';

function MyModal({isModalOpen, setIsModalOpen, formValue, setFormValue, onConfirm, onCancel, cropCanvas}) {

  const handleOk = () => {
    // 在这里处理确认按钮的逻辑，例如提交表单等操作
    onConfirm();
    setFormValue(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    // 在这里处理取消按钮的逻辑，例如清空表单等操作
    onCancel();
    setFormValue(null);
    setIsModalOpen(false);
  };

  const renderFormContent = () => {
    if (!formValue) {
      return (
        <div style={{ minWidth: '200px' }}>
          Processing
        </div>
      );
    }
  
    if (formValue.startsWith('<html>')) {
      return htmr(formValue, {
        transform: {
          form: 'div', // 将 form 元素转换为 div 元素
          // 可根据需要添加其他元素的转换规则
        },
      });
    }
  
    return (
      <textarea
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        style={{ width: '90%', height: '90%', fontSize: 'larger' }}
      />
    );
  };
  

  return (
    
    <Modal title="识别结果" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: '1', width: '30vw', height: '50vh', overflow: 'auto' }}>
          {cropCanvas ? <img src={cropCanvas.toDataURL()} alt="Cropped" style={{ width: '100%' }} /> : null}
        </div>
        <RightOutlined style={{ margin: '0 10px', fontSize: '30px'}} />
        <div style={{ flex: '1', width: '30vw', height: '50vh', overflow: 'auto' }}>
          {renderFormContent()}
        </div>
      </div>
    </Modal>
  );
}

export default MyModal;
