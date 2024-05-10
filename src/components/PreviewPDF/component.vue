<script lang="js" setup>
import { ref } from 'vue';
import { Message } from 'tdesign-mobile-vue';


const files = ref([]);
const onValidate = (context) => {
  if (context.type === 'FILE_OVER_SIZE_LIMIT') {
    Message.warning('文件大小超出上限');
  }
};

const handlePdfUpload = (file) => {
  // 文件上传逻辑
  console.log(file);
};

</script>

<template lang="">
  <div class='upload_preview'>
    <div class='upload_content'>
    <t-upload
      v-model="files"
      :multiple="false"
      :max="1"
      :size-limit="{ size: 3000000, unit: 'B' }"
      accept=".pdf"
      @validate="onValidate"
      action="//service-bv448zsw-1257786608.gz.apigw.tencentcs.com/api/upload-demo"
      @requestMethod="handlePdfUpload"
      @success="handlePdfUpload"
    >
    </t-upload>
  </div>
  </div>
</template>

<style scoped lang="css">
  .upload_preview {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .upload_content {
    --td-upload-width: 343px;
    --td-upload-height: 200px;
    --td-upload-grid-columns: 1;
  }

</style>